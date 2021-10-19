const FundraiserFactoryContract = artifacts.require("FundraiserFactory");
const FundraiserContract = artifacts.require("Fundraiser");

contract("FundraiserFactory: deployment", (accounts) => {
  it("has been deployed", async () => {
    const fundraiserFactory = FundraiserFactoryContract.deployed();
    assert(fundraiserFactory, "fundraiser factory was not deployed");
  });
});

contract("Fundraiser Factory: createFundraiser", (accounts) => {
  let fundraiserFactory;

  const name = "Beneficiary Name";
  const url = "beneficiaryname.org";
  const imageURL = "https://placepuppy.com/100/100";
  const bio = "Beneficary Description";
  const beneficiary = accounts[1];

  it("increments the fundraiserCount", async () => {
    fundraiserFactory = await FundraiserFactoryContract.deployed();
    const currentFundraiserCount = await fundraiserFactory.fundraisersCount();

    await fundraiserFactory.createFundraiser(
      name,
      url,
      imageURL,
      bio,
      beneficiary
    );

    const newFundraiserCount = await fundraiserFactory.fundraisersCount();

    assert.equal(newFundraiserCount - currentFundraiserCount, 1, "should increment by 1");
  });

  it("emits the FundraiserCreated event", async () => {
    fundraiserFactory = await FundraiserFactoryContract.deployed();

    const tx = await fundraiserFactory.createFundraiser(
      name, 
      url, 
      imageURL,
      bio,
      beneficiary
    );

    const expectedEvent = "FundraiserCreated";
    const actualEvent = tx.logs[0].event;

    assert.equal(actualEvent, expectedEvent, "events should match");
  });
});

contract("Fundraiser: fundraisers", (accounts) => {
  async function createFundraiserFactory(fundraiserCount, accounts) {
    const factory = await FundraiserFactoryContract.new();

    await addFundraisers(factory, fundraiserCount, accounts);

    return factory;
  }

  async function addFundraisers(factory, count, accounts) {
    const name = 'Beneficiary';
    const lowerCaseName = name.toLowerCase();
    const beneficiary = accounts[1];

    for (let i = 0; i < count; i ++) {
      await factory.createFundraiser(
        // create a series of fundraisers. The index will be used to make them each unique
        `${name} ${i}`,
        `${lowerCaseName}${i}.com`,
        `${lowerCaseName}${i}.png`,
        `Description of ${name} ${i}`,
        beneficiary
      );
    }
  }

  describe("when fundraisers collection is empty", () => {
    it ("returns an empty collection", async () => {
      const factory = await createFundraiserFactory(0, accounts);
      const fundraisers = await factory.fundraisers(10, 0);

      assert.equal(fundraisers.length, 0, "collection should be empty");
    });
  });

  describe("varying limits", async () => {
    let factory;

    beforeEach(async () => {
      factory = await createFundraiserFactory(30, accounts);
    });

    it("returns 10 results when limit requested is 10", async () => {
      const fundraisers = await factory.fundraisers(10, 0);

      assert.equal(fundraisers.length, 10, "results size should be 10");
    });

    // xit marks the test is pending
    it("returns 20 results when limit requested is 20", async () => {
      const fundraisers = await factory.fundraisers(20, 0);

      assert.equal(fundraisers.length, 20, "results size should be 20");
    });

    it("returns 20 results when limit requested is 30", async () => {
      const fundraisers = await factory.fundraisers(30, 0);

      assert.equal(fundraisers.length, 20, "results size should be 20");
    });
  });

  describe("varying offset", () => {
    let factory;

    beforeEach(async () => {
      factory = await createFundraiserFactory(10, accounts);
    });

    it("contains the fundraiser with the appropiate offset", async () => {
      const fundraisers = await factory.fundraisers(1, 0);
      const fundraiser = await FundraisersContract.at(fundraisers[0]);
      const name = await fundraiser.name();

      assert.ok(await name.includes(7), `${name} did not include the offset`);
    });

    it("contains the fundraiser with the appropiate offset", async () => {
      const fundraisers = await factory.fundraisers(1, 7);
      const fundraiser = await FundraiserContract.at(fundraisers[0]);
      const name = await fundraiser.name();
      assert.ok(await name.includes(7), `${name} did not include the offset`);
    });
  });
});