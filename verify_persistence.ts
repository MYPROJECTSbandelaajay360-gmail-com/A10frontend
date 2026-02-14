
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Connecting to DB...')
  // Verify user exists
  const email = 'employee@cognitbotz.com'
  const user = await prisma.user.findUnique({
    where: { email },
    include: { employee: true }
  })

  if (!user) {
    console.log(`User ${email} not found!`)
    return
  }
  
  console.log('Current User/Employee Data:')
  console.log(`User ID: ${user.id}`)
  console.log(`Employee Name: ${user.employee?.firstName} ${user.employee?.lastName}`)
  console.log(`Employee Image: ${user.employee?.profileImage}`)

  // Update name to something random
  const newName = `TestName_${Date.now()}`
  console.log(`Updating Name to: ${newName}`)

  if (user.employee) {
    const updated = await prisma.employee.update({
        where: { id: user.employee.id },
        data: { firstName: newName }
    })
    console.log('Update successful.')
    console.log(`New Name in DB: ${updated.firstName}`)
    
    // Disconnect and reconnect to verify persistence (simulated by new query)
    const verify = await prisma.user.findUnique({
        where: { email },
        include: { employee: true }
    })
    console.log(`Verified Name after fetch: ${verify?.employee?.firstName}`)
    
    if (verify?.employee?.firstName === newName) {
        console.log('SUCCESS: DB update persists immediately.')
    } else {
        console.log('FAILURE: DB update NOT persisted immediately.')
    }
  } else {
      console.log('No employee record found to update.')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
