class Preference {
	constructor(x, prefers) {
		/*
		A is paired with X and prefers set of objects [U, V, ... W] over X. 
		@param x int X in the above example.
		@param prefers list of ints that A prefers over X.
		*/
		this.has = has
		this.prefers = prefers
	} // constructor
} // preference class

function generateInput(n) {
	/*
	Randomly generates a list of n lists, each n elements long.
	Any inner list has integers 0, 1, ... n - 1 (inclusive) in shuffled order.
	@param n number of candidates / companies
	@return preferenceList
	*/

	const preferenceList = []
	for(let i = 0; i < n; i++) {
		let newList = [...Array(n).keys] // creates list [0, 1, ... n - 1]
		shuffle(newList)				 // shuffle that list
		preferenceList.push(newList)	 // push it to preferenceList
	} // i

	return preferenceList

} // method

function oracle(stableMatching) {
	/*
	oracle for a generic stable matching function.
	@param stableMatching stable matching function
		@param companies	2D array of numbers representing company preferences
		@param candidates	2D array of numbers representing candidate preferences
		@return hireArray	array of Hire objects that pair a candidate with a company
	@return void, throws an error if stableMatching does not correctly implement a solution \
		to the stable matching problem.
	*/

	const numTests = 200
	for(let i = 0; i < numTests; i++) {
		let n = 12;
		let companies = generateInput(n);
		let candidates = generateInput(n);
		let hires = stableMatching(companies, candidates);

		test('Hires length is correct', function() {
			assert(companies.length === n && companies.length === hires.length && companies.length == candidates.length);
		}); // function, test

		test('Each company and candidate occurs exactly once in Hire array', function() {
			
			/*
			Note that we would't have to use a list to keep track of which elements have been seen if the Ocelot
			IDE included a Set data type (!!!)
			*/
			let testCompanies 	= []
			let testCandidates 	= []

			for(let hireInd = 0; hireInd < n; hireInd++) {
				let hireObj = hires[hireInd];
				
				assert(!testCompanies.includes(hireObj.company));
				assert(!testCandidates.includes(hireObj.candidate));

				assert(0 <= hireObj.company && hireObj.company < n)
				assert(0 <= hireObj.candidate && hireObj.candidate < n)

				testCompanies.push(hireObj.company)
				testCandidates.push(hireObj.candidate)
			} // hireInd
		}) // function, test	

		test('Test stability', function() {
			// test stability

			

			function consistent(aPref, bPref) {
				/*
				Returns true if preference A and preference B are stable together.
				*/
				return !(bPref.prefers.includes(aPref.has) && aPref.prefers.includes(bPref.has))
			} // consistent function

			let companyPreferences = []
			let candidatePreferences = []

			// load preference objects
			for(let hireInd = 0; hireInd < n; hireInd++) {
				
				let hireObj = hires[hireInd];
				
				let company = hireObj.company
				let candidate = hireObj.candidate

				let coPreference = new Preference(candidate, candidates.subarray(0, candidates.indexOf(candidate)))
				let caPreference = new Preference(company, companies.subarray(0, companies.indexOf(company)))

				companyPreferences.push(coPreference)
				candidatePreferences.push(caPreference)

			} // hireInd

			// check every possible combination to see if all are consistent with one another.
			for(let coInd = 0; coInd < n; coInd++) {
				for(let caInd = 0; caInd < coInd; caInd++) {
					assert(consistent(candidatePreferences[caInd], coPreference[coInd]));
				} // caInd
			} // coInd
		}) // function, test
		
	} // i
} // method

function compareOffers(x, y) {
	/*
	Returns true if offers X and Y are identical.
	@param x offer
	@param y offer
	@return true if x and y are identical, false otherwise 
	*/

	return x.from === y.from && x.to === y.to && x.fromCo == y.fromCo;
}
function runOracle(f) {
	/*
	Tests run-offer function f for valid results.
	Throws an error if f does not work.
	@param f function that runs matching algorithm
		@param companies number[][] company preferences
		@param candidates number[][] candidate preferences
		@return Run object that traces algorithm progression
	@return void
	*/

	const numTests = 200;
	for(let runCounter = 0; runCounter < numTests; runCounter++) {
		let n = 12
		let companies = generateInput(n)
		let candidates = generateInput(n)

		let runResults = f(companies, candidates)

		test('Test f fidelity to algorithm requirements', function() {
			let highestPrefCompany = []
			let highestPrefCandidate = []

			let seenOffersList = []

			for(let p = 0; p < n; p++) {
				highestPrefCompany.push(0)
				highestPrefCandidate.push(0)
			} // p

			for(let offerInd = 0; offerInd < runResults.trace.length; offerInd++) {
				let offer = runResults.trace[offerInd]

				// first, assert we haven't already seen the offer
				for(let seenInd = 0; seenInd < seenOffersList.length; seenInd++) {
					assert(!compareOffers(offer, seenOffersList[seenInd]));
				} // seenInd

				// now, assert that the offerer is offering to the highest available that they
				// haven't yet offered.
				if(offer.fromCo) {
					assert(companies[offer.from][highestPrefCompany[offer.from]] === offer.to)
					highestPrefCompany[offer.from] += 1;
				} // if offer.fromCo
				else {
					assert(candidates[offer.from][highestPrefCandidate[offer.from]] === offer.to)
					highestPrefCandidate[offer.from] += 1;
				} // else offer.fromCo

				
			} // offerInd
		}) // test
	} // runCounter
} // method runOracle