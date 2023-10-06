import { createFilterWrapper, debounceFilter } from './filters'

it('debounce', async () => {
  const debouncedFilterSpy = jest.fn()
  const filter = createFilterWrapper(debounceFilter(1000), debouncedFilterSpy)

  await Promise.all([
    filter(),
    new Promise(resolve => setTimeout(() => resolve(filter()), 200)),
  ])

  expect(debouncedFilterSpy).toHaveBeenCalledTimes(1)
})
