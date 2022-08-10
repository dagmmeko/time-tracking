
export const AuthResolver = {
    Query: {
       getAccount: async(_, args) => {
           console.log(args)
           return [{name: "args"}]
       }
   }
}