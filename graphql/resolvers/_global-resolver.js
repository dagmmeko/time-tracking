
export const GlobalResolver = {
    Query: {
        _appName: async (_root, __args, { auth, checkOrigin }) => {
          const { isApiKey } = await auth({})
          if (!isApiKey) {
            await checkOrigin()
          }
          return 'Semuny'
        },
      },
    
      Mutation: {
        _appName: async (_root, __args, { auth, checkOrigin }) => {
          const { isApiKey } = await auth({})
          if (!isApiKey) {
            await checkOrigin()
          }
          return 'Semuny'
        },
      },
}