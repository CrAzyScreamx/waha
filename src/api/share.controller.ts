import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiExcludeController,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Action } from '@waha/core/auth/casl.types';
import { CanSession, FromParam } from '@waha/core/auth/policies';
import { CheckPolicies } from '@waha/core/auth/policies.decorator';
import { PoliciesGuard } from '@waha/core/auth/policies.guard';
import { SessionService } from '@waha/core/services/SessionService';
import {
  SHARE_INJECT_JS,
  SHARE_PAGE_HTML,
} from '@waha/core/share/share.assets';
import { ShareLinkService } from '@waha/core/share/ShareLinkService';
import { SessionApiParam } from '@waha/nestjs/params/SessionApiParam';
import { WAHASessionStatus } from '@waha/structures/enums.dto';
import {
  ShareLink,
  ShareRequestCodeRequest,
  ShareState,
} from '@waha/structures/share.dto';

import { SessionManager } from '../core/abc/manager.abc';

@ApiSecurity('api_key')
@Controller('api/sessions')
@ApiTags('🖥️ Sessions')
@UseGuards(PoliciesGuard)
class ShareLinkController {
  constructor(
    private readonly shareLinks: ShareLinkService,
    private readonly sessionService: SessionService,
  ) {}

  @Post(':session/share-link')
  @SessionApiParam
  @ApiOperation({
    summary: 'Create a public pairing link for the session',
    description:
      'Anyone holding the link can scan the QR code or request a pairing code, ' +
      'without an API key. The link closes once the session is paired, or when it expires.',
  })
  @CheckPolicies(CanSession(Action.Control, FromParam('session')))
  async create(@Param('session') session: string): Promise<ShareLink> {
    await this.sessionService.getSession(session);
    return this.shareLinks.create(session);
  }
}

/**
 * Public - reachable without an API key, so it exposes nothing but pairing for
 * the single session the token was signed for.
 */
@ApiExcludeController()
@Controller('share')
class SharePublicController {
  constructor(
    private readonly shareLinks: ShareLinkService,
    private readonly sessionService: SessionService,
    private readonly manager: SessionManager,
  ) {}

  @Get('inject.js')
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  script(): string {
    return SHARE_INJECT_JS;
  }

  @Get(':token')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  page(): string {
    return SHARE_PAGE_HTML;
  }

  @Get(':token/state')
  async state(@Param('token') token: string): Promise<ShareState> {
    const name = this.shareLinks.resolve(token);
    const session = await this.sessionService.getSession(name);
    if (session.status === WAHASessionStatus.WORKING) {
      this.shareLinks.close(token);
    }
    return {
      session: name,
      status: session.status,
      qr: await this.getQR(name, session.status),
    };
  }

  @Post(':token/start')
  async start(@Param('token') token: string): Promise<void> {
    const name = this.shareLinks.resolve(token);
    await this.sessionService.startSession(name);
  }

  @Post(':token/request-code')
  async requestCode(
    @Param('token') token: string,
    @Body() request: ShareRequestCodeRequest,
  ) {
    const name = this.shareLinks.resolve(token);
    const phoneNumber = String(request.phoneNumber ?? '').replace(/\D/g, '');
    if (phoneNumber.length < 8 || phoneNumber.length > 15) {
      throw new BadRequestException(
        'Provide the phone number in international format',
      );
    }
    const session = await this.manager.waitUntilStatus(name, [
      WAHASessionStatus.SCAN_QR_CODE,
    ]);
    return session.requestCode(phoneNumber, null);
  }

  private async getQR(
    name: string,
    status: WAHASessionStatus,
  ): Promise<string | null> {
    if (status !== WAHASessionStatus.SCAN_QR_CODE) {
      return null;
    }
    const qr = this.manager.getSession(name).getQR();
    if (!qr?.raw) {
      return null;
    }
    const png = await qr.get();
    return `data:image/png;base64,${png.toString('base64')}`;
  }
}

export { ShareLinkController, SharePublicController };
