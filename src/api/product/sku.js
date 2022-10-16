/* sku管理模块的接口 */
import request from '@/utils/request'

// 获取sku列表
export const reqSkuList = (page, limit) => request({
  url: `/admin/product/list/${page}/${limit}`,
  method: 'get'
})
// 上架sku
export const reqSale = (skuId) => request({
  url: `/admin/product/onSale/${skuId}`,
  method: 'get'
})
// 下架sku
export const reqCancelSale = (skuId) => request({
  url: `/admin/product/cancelSale/${skuId}`,
  method: 'get'
})
// 获取sku详情
export const reqGetSkuInfo = (skuId) => request({
  url: `/admin/product/getSkuById/${skuId}`,
  method: 'get'
})
