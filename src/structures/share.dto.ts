import { ApiProperty } from '@nestjs/swagger';

import { WAHASessionStatus } from './enums.dto';

export class ShareLink {
  @ApiProperty({ description: 'Signed token that identifies the link' })
  token: string;

  @ApiProperty({
    description: 'Path to open, relative to this server',
    example: '/share/eyJzIjoiZGVmYXVsdCJ9.abc',
  })
  path: string;

  @ApiProperty({ description: 'When the link stops working' })
  expiresAt: string;
}

export class ShareState {
  session: string;

  status: WAHASessionStatus;

  @ApiProperty({
    description:
      'QR code as a data URL, when the session is waiting for a scan',
    nullable: true,
  })
  qr: string | null;
}

export class ShareRequestCodeRequest {
  @ApiProperty({
    description: 'Mobile phone number in international format',
    example: '12132132130',
  })
  phoneNumber: string;
}
