/**
 * Compress an output.
 * @param {Output} output
 * @param {BufferWriter} bw
 */
declare function compressOutput(output: Output, bw: BufferWriter): BufferWriter;
/**
 * Decompress a script from buffer reader.
 * @param {Output} output
 * @param {BufferReader} br
 */
declare function decompressOutput(output: Output, br: BufferReader): Output;
/**
 * Calculate output size.
 * @returns {Number}
 */
declare function sizeOutput(output: any): number;
export { compressOutput as pack, decompressOutput as unpack, sizeOutput as size };
//# sourceMappingURL=compress.d.ts.map