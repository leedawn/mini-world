module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv:['<rootDir>/__tests__/setup.ts'] // 本来是解决 JSDOM 问题，但是没有效果
}
