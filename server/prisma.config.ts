export default {
  schema: './prisma/schema.prisma',
  database: {
    url: process.env.DATABASE_URL,
  },
}
