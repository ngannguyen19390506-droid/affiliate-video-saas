import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class VideoProjectService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo draft VideoProject ngay khi user bấm Generate
   */
  createDraft(input: {
  productId: string        // ⭐ THÊM
  type: 'SELL' | 'BUILD'
  formatId?: string
  inputMedia: any
}) {
  return this.prisma.videoProject.create({
    data: {
      productId: input.productId, // ⭐ DÒNG QUYẾT ĐỊNH
      type: input.type,
      formatId: input.formatId,
      inputMedia: input.inputMedia,
    },
  })
}


  /**
   * Lưu kết quả Vision (JSON đã Zod validate)
   */
  updateVision(id: string, visionData: any) {
    return this.prisma.videoProject.update({
      where: { id },
      data: { visionData },
    })
  }

  /**
   * Lưu script + caption
   */
  updateScript(
  id: string,
  scriptData: any,
  caption?: string | null,
) {
  return this.prisma.videoProject.update({
    where: { id },
    data: {
      scriptData,
      caption: caption ?? null,
    },
  });
}


  /**
   * Lưu đường dẫn file voice TTS (.mp3)
   */
  updateVoice(id: string, voicePath: string) {
    return this.prisma.videoProject.update({
      where: { id },
      data: { voicePath },
    })
  }

  /**
   * Đánh dấu render thành công
   */
  markRenderDone(id: string) {
    return this.prisma.videoProject.update({
      where: { id },
      data: { renderStatus: 'DONE' },
    })
  }

  /**
   * Đánh dấu render thất bại
   */
  markRenderFail(id: string) {
    return this.prisma.videoProject.update({
      where: { id },
      data: { renderStatus: 'FAIL' },
    })
  }
}
