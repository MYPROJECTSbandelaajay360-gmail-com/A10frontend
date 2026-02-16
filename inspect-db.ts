
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const depts = await prisma.department.findMany()
    const desigs = await prisma.designation.findMany()

    console.log('--- DEPARTMENTS ---')
    console.log(JSON.stringify(depts, null, 2))
    console.log('--- DESIGNATIONS ---')
    console.log(JSON.stringify(desigs, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
