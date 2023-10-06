describe('beforeEach', () => {
  it('calls beforeEach guards on navigation', async () => {
    const spy = jest.fn()
    const router = createRouter({ routes })
    router.beforeEach(spy)
    spy.mockImplementationOnce(noGuard)
    await router.push('/foo')
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
