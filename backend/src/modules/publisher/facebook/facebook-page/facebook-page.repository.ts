import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../common/prisma/prisma.service'

@Injectable()
export class FacebookPageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByWorkspace(workspaceId: string) {
    return this.prisma.facebookPage.findFirst({
      where: { workspaceId },
    })
  }
}
