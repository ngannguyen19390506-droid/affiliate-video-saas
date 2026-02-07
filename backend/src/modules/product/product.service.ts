import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateProductDto } from './product.dto'
import { ProductStatus } from '@prisma/client' // ✅ THÊM

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        id: `prod_${Date.now()}`,
        workspaceId,
        status: ProductStatus.TEST, // ✅ FIX CHUẨN
      },
    })
  }

  async findByWorkspace(workspaceId: string) {
    return this.prisma.product.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    })
  }
}
