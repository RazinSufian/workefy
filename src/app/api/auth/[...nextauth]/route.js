
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnection from "@/lib/dbConnect"
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const conn = await dbConnection()
        const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", [credentials.email])
        
        const users = rows[]
        if (users.length > 0) {
          const user = users[0];
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordCorrect) {
            return { ...user, id: user.user_id.toString() }
          }
          return null
        } else {
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id 
        session.user.role = token.role 
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }
