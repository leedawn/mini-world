export function createFilterWrapper(filter: any, fn: any) {
  function wrapper(this: any, ...args: any[]) {
    return new Promise((resolve, reject) => {
      Promise.resolve(
        filter(() => fn.apply(this, args), { fn, thisArg: this, args })
      )
        .then(resolve)
        .catch(reject)
    })
  }
  return wrapper
}

export function debounceFilter(time: number) {
  let timer: ReturnType<typeof setTimeout>
  const filter = (invoke: any) => {
    return new Promise(resolve => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        resolve(invoke())
      }, time)
    })
  }
  return filter
}
