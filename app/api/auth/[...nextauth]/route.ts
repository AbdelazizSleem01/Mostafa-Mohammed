import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import Admin from '@/models/Admin'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }

          await dbConnect()

          const adminCount = await Admin.countDocuments()
          
          if (adminCount === 0) {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@barista.com'
            let passwordToStore = process.env.ADMIN_PASSWORD_HASH
            
            if (!passwordToStore) {
              passwordToStore = await bcrypt.hash('admin123', 10)
            }

            await Admin.create({
              email: adminEmail,
              password: passwordToStore
            })
          }

          const admin = await Admin.findOne({ email: credentials.email })

          if (!admin) {
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, admin.password)

          if (isValid) {
            return {
              id: admin._id.toString(),
              email: admin.email,
              name: 'Admin'
            }
          }

          return null
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }