import {
  DailyAction,
  Product,
  ProductStatus as PrismaProductStatus,
} from '@prisma/client';

import {
  DailyActionResponse,
  ProductStatus as DtoProductStatus,
} from './dto/daily-action.response';

/**
 * Map DailyAction (Prisma entity)
 * -> DailyActionResponse (DTO cho FE)
 */
export function mapDailyActionToResponse(
  action: DailyAction & { product: Product },
): DailyActionResponse {
  return {
    id: action.id,

    product: {
      id: action.product.id,
      status: mapProductStatus(action.product.status),
    },

    action: {
      type: mapActionType(action.actionType),
      label: mapActionLabel(action.actionType),
    },

    reason: action.reason,
    priority: action.priority,

    meta: {
      canMarkDone: !action.isDone,
    },
  };
}

/**
 * Map Prisma ProductStatus -> DTO ProductStatus cho FE
 * FE chỉ biết: TEST | CONTINUE | STOP
 */
function mapProductStatus(
  status: PrismaProductStatus,
): DtoProductStatus {
  switch (status) {
    case 'TEST':
    case 'CONTINUE':
    case 'STOP':
      return status;

    // REVISIT hoặc trạng thái tương lai
    default:
      return 'STOP';
  }
}

/**
 * Map actionType (Prisma enum/string) -> DTO action.type
 */
function mapActionType(actionType: string) {
  switch (actionType) {
    case 'MAKE_MORE_VIDEOS':
      return 'MAKE_MORE_VIDEOS';
    case 'SCALE_FORMAT':
      return 'SCALE_FORMAT';
    case 'STOP_PRODUCT':
      return 'STOP_PRODUCT';
    default:
      throw new Error(`Unsupported actionType: ${actionType}`);
  }
}

/**
 * Map actionType -> label hiển thị cho FE
 * FE không hardcode text
 */
function mapActionLabel(actionType: string) {
  switch (actionType) {
    case 'MAKE_MORE_VIDEOS':
      return 'Làm thêm video';
    case 'SCALE_FORMAT':
      return 'Nhân bản format tốt';
    case 'STOP_PRODUCT':
      return 'Dừng sản phẩm';
    default:
      return actionType;
  }
}
