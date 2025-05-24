const levels = [
    {
        // Level 1: Static Sentence (User types full sentence in place)
        words: [
            "The quick brown fox jumps over the lazy dog while the wind gently blows through the tall green grass.",
            "Every evening, the children gather around the fireplace to listen to their grandfather’s adventurous stories.",
            "On weekends, we walk through the quiet forest trail and observe birds building nests in the trees above.",
            "She practiced piano every day after school so she could play her favorite song perfectly at the recital.",
            "The sky turned orange and purple as the sun slowly set behind the distant snow-covered mountains.",
            "Baking cookies with mom on a rainy day is one of my favorite childhood memories that I will always treasure.",
            "Before the trip, we packed our bags with clothes, snacks, toys, and games to keep us busy on the road.",
            "A group of friends built a treehouse in the backyard, painting it blue and decorating it with fairy lights.",
            "The dog barked excitedly when it saw the mailman approach the house, wagging its tail in joy.",
            "During the summer, we visited the beach almost every day to swim, build sandcastles, and collect seashells."
        ],
        timeLimit: 30,
        requiredSpeed: 20,
        weight: 10
    },
    {
        // Level 2: Horizontal Scrolling Word-by-Word
        words: [
            "When the teacher announced the class would go on a field trip, everyone jumped up from their seats in excitement.",
            "The little boy carefully balanced the stack of books in his hands while walking slowly to the library desk.",
            "Each morning, the baker wakes up before sunrise to prepare fresh bread and pastries for the local customers.",
            "Our science project involved growing plants in different conditions to see which one would grow the fastest.",
            "After finishing their homework, the kids gathered outside to play soccer until the streetlights turned on.",
            "The storm shook the windows and made the lights flicker, but we stayed calm and read books by flashlight.",
            "She trained her puppy by giving it treats every time it sat, rolled over, or followed a new command.",
            "Grandma’s garden was full of colorful flowers, buzzing bees, and butterflies dancing in the sunlight.",
            "He drew a comic book with superheroes who could fly, become invisible, and shoot laser beams from their eyes.",
            "At the end of the race, everyone cheered as the last runner crossed the finish line with a big smile."
        ],
        timeLimit: 25,
        requiredSpeed: 25,
        weight: 15
    },
    {
        // Level 3: Bottom-to-Top Moving Words
        words: [
            "Reading is fun when you find a good book.",
            "We discovered a new planet in the game.",
            "My robot toy lights up and talks too.",
            "She built a tall tower with blocks.",
            "The rocket zoomed into the sky quickly.",
            "We saw dolphins jumping out of the water.",
            "I painted a sunset with orange and red.",
            "The squirrel hid a nut in the ground.",
            "My backpack is full of books and snacks.",
            "He found a shiny coin on the road.",
            "The garden smells fresh after the rain.",
            "We played tag until the sun went down.",
            "I like puzzles with lots of tiny pieces.",
            "The cat chased the red laser light.",
            "The clock ticks loudly at midnight."
        ],
        timeLimit: 20,
        requiredSpeed: 30,
        weight: 20
    },
    {
        // Level 4: Appearing and Disappearing Words (Memory & Speed Challenge)
        words: [
            "Always be kind to others and share what you have.",
            "Laughter is the best medicine for a sad heart.",
            "Your dreams are valid no matter your age.",
            "We grow when we learn from our mistakes.",
            "Courage means trying even when it's hard.",
            "Teamwork makes everything easier and more fun.",
            "Helping friends is a great way to show love.",
            "Confidence is believing in what you can do.",
            "Be honest, even when it's not easy.",
            "Every small step leads to a big change.",
            "Good manners are always appreciated by others.",
            "Patience helps us make better decisions.",
            "Practice every day to improve your skills.",
            "Smiling can brighten someone’s whole day.",
            "Listening is just as important as talking."
        ],
        timeLimit: 15,
        requiredSpeed: 35,
        weight: 25
    },
    {
        // Level 5: Falling Words (Fast reaction test)
        words: [
            "Success is built on daily good habits.",
            "You are braver than you think you are.",
            "Stay curious and keep asking questions.",
            "Even superheroes need help sometimes.",
            "Don't give up, greatness takes time.",
            "Be the reason someone smiles today.",
            "Mistakes help us get better each time.",
            "You can do amazing things with effort.",
            "Learning is the key to every door.",
            "Your kindness makes the world brighter.",
            "A small act of kindness matters a lot.",
            "Your attitude shapes your future path.",
            "Being different makes you special.",
            "Effort always beats instant talent.",
            "Trust yourself and take the leap."
        ],
        timeLimit: 10,
        requiredSpeed: 40,
        weight: 30
    }
];

export default levels;
