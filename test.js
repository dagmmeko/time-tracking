import client from "./db.js"


async function test () {
    try {
        const db = client.db("time-tracker")
  const collection = db.collection('documents');
  const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
console.log('Inserted documents =>', insertResult);
    } catch (err){
        console.log(err)
    }
}

export default test