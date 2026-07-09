import pmggImg from '../assets/pmgg.jpg'
import techEduImg from '../assets/tech_edu.jpg'
import hospitalImg from '../assets/hospital.jpg'
import financeImg from '../assets/finance.jpg'
import greenImg from '../assets/socialenviroment.jpg'
import techImg from '../assets/technology.jpg'
import cyberImg from '../assets/cybersecurity.jpg'
import ecomImg from '../assets/ecomercial.jpg'

export const SECTOR_IMAGES = {
  fmcg: pmggImg,
  edtech: techEduImg,
  medtech: hospitalImg,
  fintech: financeImg,
  greentech: greenImg,
  ai: techImg,
  cybersec: cyberImg,
  ecommerce: ecomImg,
}

const ID_TO_KEY = {
  fmcg: 'fmcg',
  'vy-edtech': 'edtech',
  'bach-medtech': 'medtech',
  'tram-fintech': 'fintech',
  'duong-greentech': 'greentech',
  'khanh-ai': 'ai',
  cybersec: 'cybersec',
  'linh-ecommerce': 'ecommerce',
}

const SHORT_TO_KEY = {
  FMCG: 'fmcg',
  EdTech: 'edtech',
  MedTech: 'medtech',
  FinTech: 'fintech',
  GreenTech: 'greentech',
  AI: 'ai',
  CyberSec: 'cybersec',
  'E-Commerce': 'ecommerce',
}

const NAME_TO_KEY = {
  FMCG: 'fmcg',
  EdTech: 'edtech',
  MedTech: 'medtech',
  FinTech: 'fintech',
  GreenTech: 'greentech',
  AI: 'ai',
  CyberSec: 'cybersec',
  'E-Commerce': 'ecommerce',
}

export function getSectorImage({ teamKey, id, sectorShort, name } = {}) {
  const key = teamKey
    || (id && ID_TO_KEY[id])
    || (sectorShort && SHORT_TO_KEY[sectorShort])
    || (name && NAME_TO_KEY[name])
  return key ? SECTOR_IMAGES[key] : null
}
