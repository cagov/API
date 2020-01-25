// A helper function used to read a Node.js readable stream into a string
module.exports = async function streamToString(readableStream) {
  console.log('hello')
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      console.log('has chunk')
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      console.log('and ended')
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}
