import { generateService } from '@umijs/openapi'

// openapi配置文件
generateService({
  requestLibPath: "import request from '@/request'",
  // 接口文档地址
  schemaPath: 'http://localhost:8123/api/v2/api-docs',
  serversPath: './src',
})
