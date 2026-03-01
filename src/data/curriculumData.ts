import { ProfileTemplate } from '../types';
import { validateTopic, CurriculumValidationResult } from '../lib/curriculumValidator';

export interface PlaylistRow {
  profile: string;
  subject: string;
  topic: string;
  focus: string;
  primaryPlaylist: string;
  backupPlaylist1: string;
  backupPlaylist2: string;
  notes: string;
  outcomes: string;
}

const RAW_DATA = `Y1/2 Child	English	Phonics & stories	BBC Alphablocks Phonics	Letters and Sounds	Twinkl Phonics	Blending sounds, simple sentences	Read CVC words
Y1/2 Child	Maths	Number bonds/counting	Numberblocks Series 1-2	BBC Bitesize Y1 Maths	Corbettmaths KS1	1-20 counting, addition/subtraction	Solve number stories
Y1/2 Child	Science	Plants/animals	BBC Bitesize Y1 Science	SciShow Kids Animals	Mystery Doug Plants	Life cycles, senses	Name common animals
Y1/2 Child	History	Famous people	FreeSchool Famous People	BBC History KS1	Simple History Kids	Kings/queens, inventors	Sequence events
Y1/2 Child	Geography	Local area/weather	Twinkl Geography KS1	Geography Now Kids	Kids Learning Tube	Seasons, simple maps	Describe local environment
Y1/2 Child	MFL (French/Spanish)	Colours/numbers	Duolingo Kids ABC	BBC Mini Mash Languages	Butterfly Spanish KS1	Greetings, counting to 10	Sing/count in target lang.
Y1/2 Child	Design & Technology	Joining materials	Twinkl DT KS1	Bosch Kids Explore	Design Technology Fun	Gluing, cutting, folding	Make models from kits
Y1/2 Child	Art & Design	Painting/collage	Art for Kids Hub KS1	BBC Art KS1	Draw So Cute Easy	Primary colours, patterns	Self-portraits
Y1/2 Child	Music	Rhythm/singing	BBC Ten Pieces KS1	Out of the Ark Songs	Charanga Musical School	Action songs, clapping games	Copy rhythms
Y1/2 Child	Physical Education	Movement/games	GoNoodle Movement	Cosmic Kids Yoga	Real PE Fundamentals	Throwing/catching, balance	Follow instructions
Y1/2 Child	PSHE/Citizenship	Feelings/friendship	BBC PSHE KS1	CBeebies Get Well Soon	Twinkl Feelings	Emotions, sharing	Name feelings
Y1/2 Child	Computing	Algorithms	Code.org Pre-Reader	Barefoot Computing KS1	Scratch Jr Tutorials	Directions, sequencing	Make picture recipes
Y3/4 Child	English	Stories & poems	BBC Bitesize Y4 English	Oak National Y4 Reading	Twinkl Y4 Stories	Fairy tales, inference skills	theheightsprimary.co	Retell stories orally
Y3/4 Child	Maths	Fractions basics	BBC Bitesize Y4 Maths	Corbettmaths Y4 Fractions	Numberblocks Y4	Equivalence, decimals intro	theheightsprimary.co	Solve fraction problems
Y3/4 Child	Science	Living things	BBC Bitesize Y4 Science	Oak Y4 Animals	SciShow Kids	Food chains, habitats	theheightsprimary.co	Classify vertebrates
Y3/4 Child	History	Romans/Vikings	BBC History Y4	OverSimplified Romans	FreeSchool History	Invasion timelines	theheightsprimary.co	Compare invaders
Y3/4 Child	Geography	UK regions	Geography Now Kids	Nattefrost UK Maps	Twinkl Geo Y4	Counties, rivers	theheightsprimary.co	Use maps/atlases
Y3/4 Child	MFL (French/Spanish)	Basic vocab	BBC Bitesize French Y4	Duolingo Kids French	Language Angels	Greetings, numbers	theheightsprimary.co	Simple conversations
Y3/4 Child	DT	Structures	Design Technology Y4	Twinkl DT Frames	Bosch Kids Explore	Shells/frames	theheightsprimary.co	Build models
Y3/4 Child	Art & Design	Drawing/collage	BBC Art Y4	Art for Kids Hub	Twinkl Art	Patterns, printing	theheightsprimary.co	Self-portraits
Y3/4 Child	Music	Rhythm/singing	BBC Ten Pieces Y4	Out of the Ark Songs	Charanga Music	Recorders, improv	theheightsprimary.co	Perform ensemble
Y3/4 Child	PE	Gymnastics/dance	BBC PE Y4	Cosmic Yoga	GoNoodle Dance	Balance, sequences	theheightsprimary.co	Team games
Y3/4 Child	PSHE/Citizenship	Feelings/rules	BBC PSHE Y4	School of Life Kids	Twinkl PSHE	Emotions, safety	theheightsprimary.co	Healthy choices
Y3/4 Child	Computing	Algorithms	BBC Code Y4	Code.org Y4	Barefoot Computing	Scratch basics	theheightsprimary.co	Debug programs
Y5/6 Child	English	Plays & poetry	BBC Bitesize KS2 English	Oak National Y5-6 Reading	Twinkl Y6 English	Shakespeare extracts, performance poetry	Perform scripted scenes
Y5/6 Child	Maths	Decimals/percentages	Khan Academy Y5 Maths	Corbettmaths Y5-6	White Rose Maths Y6	Converting units, ratio intro	Mental calculation speed
Y5/6 Child	Science	Earth/space	BBC Bitesize Y5-6 Science	SciShow Kids Earth	Oak Solar System	Rock cycles, planets	Explain day/night cycles
Y5/6 Child	History	Ancient Greeks/Egypt	BBC History KS2	OverSimplified Greeks	FreeSchool Ancient Civilisations	Democracy origins, pyramids	Compare time periods
Y5/6 Child	Geography	Biomes/rivers	Geography Now Kids Series	Kids Learning Tube Biomes	Twinkl Rivers Y5	Climate zones, water cycle	Fieldwork skills
Y5/6 Child	MFL (French/Spanish)	Sentences/conversations	Duolingo Kids Spanish	BBC Languages Y5-6	Butterfly Spanish Y5	Adjectives, shopping role-play	Write short paragraphs
Y5/6 Child	Design & Technology	Textiles/electronics	Twinkl DT Y5-6	Bosch Kids Make	GreatScott Simple Projects	Sewing circuits, pattern design	Market research
Y5/6 Child	Art & Design	3D modelling/sculpture	Art for Kids Hub Y5	BBC Art Y5-6	Draw So Cute 3D	Clay work, shading techniques	Sketch from observation
Y5/6 Child	Music	World music/notation	BBC Ten Pieces Y5	Out of the Ark World Music	Charanga Y5-6	Samba rhythms, staff notation	Improvise melodies
Y5/6 Child	Physical Education	Invasion games	GoNoodle PE	Real PE Y5-6	Cosmic Kids Sports	Netball tactics, striking fielding	Apply rules/strategies
Y5/6 Child	PSHE/Citizenship	Democracy/relationships	BBC PSHE Y5-6	School of Life Children	Twinkl Growth Mindset	Elections, peer pressure	Resolve conflicts
Y5/6 Child	Computing	Variables/databases	Code.org Y5-6	Scratch Advanced	Barefoot Computing Y5	Loops with conditions, sorting data	Create interactive stories
Y7/8 Child	English	Text analysis	BBC Bitesize KS3 English	Crash Course Literature	Twinkl KS3 English	Language techniques, analysis skills	Improved essay writing
Y7/8 Child	Maths	Algebra equations	Khan Academy Algebra Basics	Corbettmaths KS3 Algebra	Math Antics Algebra	Linear equations, substitution	Solve multi-step equations
Y7/8 Child	Science	Electricity circuits	SciShow Science Circuits	Engineering Mindset Circuits	Physics Online KS3	Series/parallel, Ohm's Law	Circuit design problems
Y7/8 Child	History	Cold War	Crash Course World History	OverSimplified Cold War	Simple History Cold War	1945-91 events, causes/consequences	Timeline analysis
Y7/8 Child	Geography	Country capitals	Geography Now Full Series	Kids Learning Tube Geography	FreeSchool Geography	Human geography, population patterns	Map reading skills
Y7/8 Child	Modern Foreign Languages	Spanish GCSE	Butterfly Spanish KS3	Duolingo Spanish Teens	SpanishPod101 Beginners	Verb tenses, speaking/writing	Basic conversations
Y7/8 Child	Design & Technology	Electronics	GreatScott! Circuits	ElectroBOOM Fun Electronics	Bosley Booth Electronics	LEDs/resistors, prototyping	Build simple circuits
Y7/8 Child	Art & Design	Graffiti art	Proko Perspective Drawing	Art Assignment Street Art	Draw So Cute Graffiti	Street art techniques, mixed media	Create portfolio pieces
Y7/8 Child	Music	Garageband basics	MusicTechTeacher GarageBand	Andrew Huang Music Production	YouSician Production	Loops/beats, production	Make original tracks
Y7/8 Child	Physical Education	Basketball drills	ILoveBasketballTV Drills	Coach Dan Youth Drills	Pro Skills Basketball	Shooting/defense, team tactics	Game strategy
Y7/8 Child	Citizenship	Democracy	FreeSchool Government	School of Life Politics	Crash Course Government	Voting systems, rights/responsibilities	Debate civic issues
Y7/8 Child	Computing	Python basics	freeCodeCamp Python Kids	CS50 Python Intro	Code.org Python KS3	Variables/functions, problem-solving	Code simple programs
Y9/10 Child	English	GCSE Language Paper 1	BBC GCSE English Language	Mr Bruff GCSE English	GCSE English Tutor	Creative writing, question 5 skills	Grade 5+ responses
Y9/10 Child	Maths	GCSE Foundation	Corbettmaths GCSE Foundation	Khan Academy GCSE	Maths Genie Foundation	Ratio, percentages, basic algebra	Foundation tier confidence
Y9/10 Child	Science	GCSE Combined Trilogy	Freesci GCSE Science	SciShow Science	Crash Course Chemistry	Atomic structure, energy changes	Required practicals
Y9/10 Child	History	GCSE Medicine/Weimar	Simple History GCSE	Crash Course History	OverSimplified WWII	Surgery c1000-present, Nazi rise	Source analysis
Y9/10 Child	Geography	GCSE Physical/Coasts	Geography All The Way	BBC GCSE Geography	Internet Geography	Rivers, coasts, climate change	Case studies (10+ examples)
Y9/10 Child	MFL (Spanish)	GCSE Themes	Spanish GCSE Podcast	Butterfly Edu Spanish	Duolingo GCSE Spanish	Identity, local area, holidays	Produce 100-word texts
Y9/10 Child	Design & Technology	GCSE Product Design	Bosch GCSE DT	GreatScott! Engineering	Tech Wizard Projects	Iterative design, tolerances	Prototype portfolio
Y9/10 Child	Art & Design	GCSE Fine Art	BBC GCSE Art	Art Of Education	Draw So Cute Advanced	Observational drawing, mixed media	Artist analysis + response
Y9/10 Child	Music	GCSE Listening/Performing	BBC Ten Pieces GCSE	4th Grade Music	Charanga GCSE	Area of study 1-4, ensemble skills	Solo + ensemble performance
Y9/10 Child	Physical Education	GCSE Fitness Training	Pro Skills Basketball GCSE	Coach Dan Advanced	PE Academy GCSE	Training methods, data analysis	B1-4 coursework
Y9/10 Child	Citizenship/PSHE	GCSE Relationships	BBC Life Skills	School of Life Teens	Twinkl PSHE GCSE	Parliament, county lines, extremism	Debate topical issues
Y9/10 Child	Computing	GCSE Computer Science	Computer Science Tutor	Code.org GCSE	Craig'n'Dave	Algorithms, Boolean logic, Python	Programming project (50%)
Y11/12 Child	English Language	GCSE Paper 1/2 Technique	Mr Bruff GCSE English	BBC GCSE English	GCSE English Tutor	Q4 language analysis, Q5 structure	Grade 7-9 responses
Y11/12 Child	English Literature	GCSE Texts (Macbeth/AQA)	Mr Bruff GCSE Literature	CGP Revision Macbeth	Prime Study Guides	Character arcs, context, themes	Full essay frameworks
Y11/12 Child	Maths	GCSE Higher Tier	Corbettmaths GCSE Higher	TLMaths	1st Class Maths	Trig identities, circle theorems	A*/9 past paper success
Y11/12 Child	Science (Triple)	GCSE Chemistry/Physics	Freesci GCSE Science	MaChemGuy	Physics Online	Organic chem, forces, required practicals	Triple award predictions
Y11/12 Child	History	GCSE Superpower Relations	Simple History GCSE	History with Higgins	SchoolshistoryGCSE	Cold War 1941-91, source Qs	12-mark explanations
Y11/12 Child	Geography	GCSE Natural Hazards	Geography All The Way	Internet Geography	Miss Geographer	Tectonics, climate hazards, 9-mark Qs	Full case study banks
Y11/12 Child	MFL (Spanish)	GCSE Higher Writing	Spanish GCSE Podcast	Butterfly Edu GCSE	Senor Jordan	Photo card, 150-word essay	AQA/Edexcel writing mastery
Y11/12 Child	Design & Technology	GCSE NEA + Theory	DT Guru GCSE	Tech Award D&T	Product Design Online	Iterative design, new tech	NEA portfolio completion
Y11/12 Child	Art & Design	GCSE Component 1	The Arty Teacher	Art Of Education UK	GCSE Art & Design	A01-A04, artist links, annotation	100-page coursework
Y11/12 Child	Physical Education	GCSE Practical + Theory	PE Academy GCSE	GCSE PE Online	Sport Science Hub	Training principles, data analysis	B1-4 full moderation
Y11/12 Child	PSHE/Citizenship	GCSE Relationships/Law	BBC Newsround Explains	Citizenship Today	PSHCE Association	Parliament, rights, county lines	Mock interviews/debates
Y11/12 Child	Computing	GCSE Programming Project	Craig'n'Dave GCSE	Computer Science Tutor	Isaac Computer Science	Python/SQL project, pseudocode, trace tables	50% programming project`;

const PROFILE_MAP: Record<string, ProfileTemplate> = {
  'Y1/2 Child': 'Y1-2',
  'Y3/4 Child': 'Y3-4',
  'Y5/6 Child': 'Y5-6',
  'Y7/8 Child': 'Y7-8',
  'Y9/10 Child': 'Y9-10',
  'Y11/12 Child': 'Y11-12',
};

const SUBJECT_MAP: Record<string, string> = {
  'MFL (French/Spanish)': 'Modern Language',
  'MFL': 'Modern Language',
  'Modern Foreign Languages': 'Modern Language',
  'Design & Technology': 'Design & Technology',
  'DT': 'Design & Technology',
  'Art & Design': 'Art & Design',
  'Physical Education': 'PE',
  'PE': 'PE',
  'PSHE/Citizenship': 'PSHE',
  'Citizenship/PSHE': 'PSHE',
  'Citizenship': 'PSHE',
  'PSHE': 'PSHE',
  'Computing': 'Computing',
  'Science (Triple)': 'Science',
};

export const parseRawData = (): PlaylistRow[] => {
  const lines = RAW_DATA.split('\n').filter(l => l.trim());
  const rows: PlaylistRow[] = [];

  for (const line of lines) {
    const cols = line.split('\t');
    if (cols.length < 4) continue;

    const profile = cols[0]?.trim();
    if (!profile || profile === 'Profile') continue;

    const yearGroup = PROFILE_MAP[profile];
    if (!yearGroup) {
      console.warn('Unknown profile:', profile);
      continue;
    }

    let subject = cols[1]?.trim() || '';
    let focus = cols[2]?.trim() || '';
    
    subject = SUBJECT_MAP[subject] || subject;
    
    const topic = focus.split(' ')[0] || subject;

    rows.push({
      profile: yearGroup,
      subject,
      topic, 
      focus,
      primaryPlaylist: cols[3]?.trim() || '',
      backupPlaylist1: cols[4]?.trim() || '',
      backupPlaylist2: cols[5]?.trim() || '',
      notes: cols[6]?.trim() || '',
      outcomes: cols[7]?.trim() || '',
    });
  }

  return rows;
};

export const validateAllPlaylists = () => {
  const rows = parseRawData();
  const results: {
    row: PlaylistRow;
    validation: CurriculumValidationResult;
    valid: boolean;
  }[] = [];

  for (const row of rows) {
    const validation = validateTopic(
      row.profile as ProfileTemplate,
      row.subject,
      row.topic,
      row.focus
    );
    results.push({ row, validation, valid: validation.isValid });
  }

  return results;
};

export const getValidationSummary = () => {
  const results = validateAllPlaylists();
  const summary = {
    total: results.length,
    valid: results.filter(r => r.valid).length,
    invalid: results.filter(r => !r.valid).length,
    byYear: {} as Record<string, { total: number; valid: number }>,
    issues: [] as string[],
  };

  for (const r of results) {
    if (!summary.byYear[r.row.profile]) {
      summary.byYear[r.row.profile] = { total: 0, valid: 0 };
    }
    summary.byYear[r.row.profile].total++;
    if (r.valid) summary.byYear[r.row.profile].valid++;

    if (!r.valid) {
      r.validation.issues.forEach(issue => {
        if (!summary.issues.includes(issue)) {
          summary.issues.push(issue);
        }
      });
    }
  }

  return { results, summary };
};
