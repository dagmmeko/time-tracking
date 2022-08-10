import {gql} from "apollo-server"

export const GlobalType = gql`
    schema{
        query: Query
        mutation: Mutation
    }

    type Query {
    """
    Returns app name
    """
    _appName: String!
  }

  type Mutation {
    """
    Returns app name
    """
    _appName: String!
  }
    ` 