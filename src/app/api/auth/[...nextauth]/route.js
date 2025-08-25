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

        try {
          const conn = await dbConnection()
          const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", [credentials.email])

          if (rows.length > 0) {
            const user = rows[0];

            if (user.password) {
              const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
              if (isPasswordCorrect) {
                return {
                  id: user.user_id.toString(),
                  name: user.name,
                  email: user.email,
                  role: user.role
                }
              }
            }
            return null
          } else {
            return null
          }
        } catch (error) {
          console.error("Authentication error:", error)
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
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl, token }) {
      // Redirect to appropriate dashboard after login
      if (token?.role) {
        switch (token.role) {
          case 'admin':
            return `${baseUrl}/admin/dashboard`
          case 'worker':
            return `${baseUrl}/worker/dashboard`
          case 'client':
            return `${baseUrl}/client/dashboard`
          default:
            return baseUrl
        }
      }
      return baseUrl
    }
  }
})

export { handler as GET, handler as POST }