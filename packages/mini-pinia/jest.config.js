module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  //   setupFilesAfterEnv:['<rootDir>/__tests__/setup.ts'] // 本来是解决 JSDOM 问题，但是没有效果
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],  // 使用 @vue/test-utils 的时候需要有这个配置
  },
}
