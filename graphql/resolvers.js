
export default {
     Query: {
        getAccount: async(_, args) => {
            console.log(args)
            return [{name: "args"}]
        }
    }
}