export function encodeParam(text: string) {
  return encodeURIComponent(text)
}

export function decode(text: string | number) {
  try {
    return decodeURIComponent('' + text)
  } catch (err) {
    // warn(`resolve ${text} error`)  // TODO： 注释掉这行代码方便测试
    return '' + text
  }
}


