import fundingImg from '../assets/goitindungnhanuoc_1.png'
import viralImg from '../assets/sanphamocop_2.png'
import taxInspectImg from '../assets/thue_3.png'
import disasterImg from '../assets/thientaimientrung_4.png'
import summitImg from '../assets/diendankinhtequocgia_5.png'
import dataBreachImg from '../assets/antoanthongtin_6.png'
import sandboxImg from '../assets/khonggiansandbox_7.png'
import cocVangImg from '../assets/tuanlekhoinghiep_8.png'

export const EVENT_IMAGES = {
  funding: fundingImg,
  viral: viralImg,
  taxInspect: taxInspectImg,
  disaster: disasterImg,
  summit: summitImg,
  dataBreach: dataBreachImg,
  sandbox: sandboxImg,
  cocVang: cocVangImg,
}

export function getEventImage({ id, eventId } = {}) {
  const key = id ?? eventId
  return key ? EVENT_IMAGES[key] : null
}
