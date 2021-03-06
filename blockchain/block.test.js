const Block = require('./block');

describe('Block', () => {
  let data, lastBlock, block;

  beforeEach(() => {
    data = 'bar';
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });

  it('sets the `data` to match the input', () => {
    expect(block.data).toEqual(data);
  });

  it('sets the `lastHash` to match the hash of the last block', () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });

  it('generates a hash that matches the difficulty requirement', () => {
    expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    console.log(block.display());
  });

  it('lowers difficulty for slowly mined block', () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 20000)).toEqual(block.difficulty - 1);
  });

  it('raises difficulty for quickly mined block', () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 500)).toEqual(block.difficulty + 1);
  });
});