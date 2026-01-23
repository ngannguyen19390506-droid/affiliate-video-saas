import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ProductService } from './product.service'
import { CreateProductDto } from './product.dto'

@Controller('workspaces/:workspaceId/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * ✅ ONBOARDING – Tạo product đầu tiên
   * POST /workspaces/:workspaceId/products
   */
  @Post()
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(workspaceId, dto)
  }

  /**
   * ✅ DASHBOARD GUARD
   * GET /workspaces/:workspaceId/products
   */
  @Get()
  async list(@Param('workspaceId') workspaceId: string) {
    return this.productService.findByWorkspace(workspaceId)
  }
}
