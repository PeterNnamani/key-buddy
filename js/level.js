const levels = [
    {
        // Level 1: Static Sentence (User types full sentence in place)
        words: [
            "The sun is shining brightly.",
            "She has a pet dog named Max.",
            "We are going to the zoo today.",
            "I love eating sweet mangoes.",
            "They play football after school.",
            "The baby is sleeping quietly.",
            "Mom baked cookies for us.",
            "He can swim very fast.",
            "I drew a cat with crayons.",
            "Birds are flying in the sky."
        ],
        timeLimit: 10, // Adjustable per sentence
        requiredSpeed: 20,
    },
    {
        // Level 2: Horizontal Scrolling Word-by-Word
        words: [
            "The children ran across the field laughing happily.",
            "I planted a sunflower in the garden yesterday.",
            "He fixed the toy car with a little screwdriver.",
            "A rainbow appeared after the rain stopped.",
            "We picked apples from the big green tree.",
            "Dad reads me a story every night before bed.",
            "My kite flew high up into the blue sky.",
            "She helped her brother tie his shoelaces.",
            "The monkey swung from branch to branch.",
            "We sang songs during our class trip."
        ],
        timeLimit: 12,
        requiredSpeed: 25,
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
            "He found a shiny coin on the road."
        ],
        timeLimit: 12,
        requiredSpeed: 30,
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
            "Every small step leads to a big change."
        ],
        timeLimit: 30,
        requiredSpeed: 35,
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
            "Your kindness makes the world brighter."
        ],
        timeLimit: 15,
        requiredSpeed: 40,
    },
];

export default levels;
