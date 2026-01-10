import { Injectable } from '@nestjs/common'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import FormData from 'form-data'

export type PublishInput = {
  pageId: string
  pageAccessToken: string
  videoPath: string   // absolute path
  caption: string
}

@Injectable()
export class FacebookPublisher {
  async publish(input: PublishInput): Promise<{ postId: string }> {
    const { pageId, pageAccessToken, videoPath, caption } = input

    if (!path.isAbsolute(videoPath)) {
      throw new Error('VIDEO_PATH_MUST_BE_ABSOLUTE')
    }

    if (!fs.existsSync(videoPath)) {
      throw new Error('VIDEO_FILE_NOT_FOUND')
    }

    const form = new FormData()
    form.append('access_token', pageAccessToken)
    form.append('description', caption)
    form.append('source', fs.createReadStream(videoPath))

    try {
      const res = await axios.post(
        `https://graph.facebook.com/v19.0/${pageId}/videos`,
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
        }
      )

      return { postId: res.data.id }
    } catch (err: any) {
      const fbError = err?.response?.data?.error

      if (!fbError) {
        throw new Error('FACEBOOK_API_ERROR')
      }

      if (fbError.code === 190) {
        throw new Error('FACEBOOK_TOKEN_EXPIRED')
      }

      if (fbError.code === 10 || fbError.code === 200) {
        throw new Error('FACEBOOK_PERMISSION_ERROR')
      }

      throw new Error(fbError.message || 'FACEBOOK_PUBLISH_FAILED')
    }
  }
}
