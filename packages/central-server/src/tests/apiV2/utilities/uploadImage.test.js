// TODO: re-enable after S3Client is properly mocked after RN-982
// describe('uploadImage', async () => {
//   let uploadImageStub;
//   let deleteFileStub;
//   const EXAMPLE_UPLOADED_IMAGE_URL = 'https://example.com/image.jpg';
//   const UNIQUE_ID = 'theUniqueId';
//   const IMAGE_SUFFIX = 'theImageSuffix';
//
//   const ENCODED_IMAGE =
//     'data:image/gif;base64,R0lGODdh4AHwANUAAKqqqgAAAO7u7ru7u+Xl5czMzN3d3cPDw7KystTU1H9/fxcXF1VVVXJych0dHRkZGS4uLo+Pjzc3N5SUlMHBwSwsLGpqahUVFSoqKklJScjIyBgYGLm5uTk5OW9vbzAwMKurqxYWFqWlpaOjoxwcHEJCQp+fn3d3d0ZGRhoaGpubm4WFhV1dXVlZWT8/P4qKimFhYTMzM25ubtDQ0ExMTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAA4AHwAAAG/kCAcEgsGo/IpHLJbDqf0Kh0Sq1ar9isdsvter/gsHhMLpvP6LR6zW673/C4fE6v2+/4vH7P7/v/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAwocSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOn/s+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsyYmIIAQyxcCIBBAREFky9YmKIAQ4AADJA8HoI5gObGlhZABmAhgwYBFCBsBjBhAQgBIAJYjoJCxowZNGYXUS2k9u3cu1FHYtDAgZANHBAAQEBhg5ASDQYAGHAChZQEBRAgSGC9CHPnALBr5+5dOSQFDwqs7uBhiIcOQlJIF4IghREXySngQhITkFAEfPLlt990/rn3CAQRALBadQxMwMAHFAgRwIIq/qxGRAIQTEAbBAkk4UFoREAooYYceujgIgxIcMCK04HwQAgBiLCfiwi4OIQIFUxQQYZJQEdEjDOuxqOPLx4ywQNErqbAAhoQUNtsAYg4BJPbvRDACwsawQADCz4ZpYZaatjkIhV85uZntkl3AAjlObDCEBOgZwQMLWSQBHwcENHmm5/Ziaeeax5igACMChAAowGMMMQIBgLAAAtDtIDigTEkYEFyRBgX5qKNPirApZlumugiqwkp4gQlgCCECboBAKgRtWVYQIhGVBCBdkmsRqtlt67KyGoHiIBjCCYAO0BtAcRpRAkR7CdCCUV49iYSqz2rmrTGLiLAEAMQIAABwMAKcYC56B6RwIxCDFAiEaQ2isS46rKbbrj89uvvvwAHLPDABBds8MEIJ6zwwgw37PDDEEcs8cQUV2zxxRhnrPHGHHfs8ccghyzyyCSXbPLJKKes8sost+zyyzDHLPPMNNds880456zzzjz37PPPQAct9NBEF2300UgnrfTSTDft9NNQRy311FRXbfXVWGet9dZcd+3112CHLfbYZJdt9tlop6322my37fbbcMct99x012333XjnrffefPft98pBAAA7';
//
//   before(async () => {
//     sinon.createStubInstance(S3);
//   });
//   beforeEach(() => {
//     uploadImageStub = sinon
//       .stub(S3Client.prototype, 'uploadImage')
//       .returns(Promise.resolve(EXAMPLE_UPLOADED_IMAGE_URL));
//     deleteFileStub = sinon.stub(S3Client.prototype, 'deleteFile').resolves();
//   });
//
//   afterEach(async () => {
//     uploadImageStub.restore();
//     deleteFileStub.restore();
//   });
//
//   it('uploads the image and returns the result if is a base64 encoded image', async () => {
//     const result = await uploadImage(ENCODED_IMAGE, UNIQUE_ID, IMAGE_SUFFIX, true);
//     expect(result).to.equal(EXAMPLE_UPLOADED_IMAGE_URL);
//     expect(deleteFileStub).not.called;
//   });
//
//   it('removes the existing image if path is passed in', async () => {
//     uploadImage(ENCODED_IMAGE, UNIQUE_ID, IMAGE_SUFFIX, true, 'existingImageUrl');
//     expect(deleteFileStub).calledWith('existingImageUrl');
//   });
//
//   it('does not upload the image if is not a base64 encoded image', async () => {
//     const result = await uploadImage(EXAMPLE_UPLOADED_IMAGE_URL, UNIQUE_ID, IMAGE_SUFFIX);
//     expect(result).to.equal(EXAMPLE_UPLOADED_IMAGE_URL);
//   });
//
//   it('does not upload the image if encodedImage param is null', async () => {
//     const result = await uploadImage(null, UNIQUE_ID, IMAGE_SUFFIX);
//     expect(result).to.equal(null);
//   });
//
//   it('does not upload the image if encodedImage param is an empty string', async () => {
//     const result = await uploadImage('', UNIQUE_ID, IMAGE_SUFFIX);
//     expect(result).to.equal('');
//   });
//
//   it('does not upload the image, and returns "" if encodedImage param is undefined', async () => {
//     const result = await uploadImage(undefined, UNIQUE_ID, IMAGE_SUFFIX);
//     expect(result).to.equal('');
//   });
// });
