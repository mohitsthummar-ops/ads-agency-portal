const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('./models/Template');

dotenv.config();

const industries = [
    { name: 'E-Commerce', prompt: 'modern online shopping, cardboard boxes, glowing mobile app interface, high-end logistics' },
    { name: 'Food & Beverage', prompt: 'delicious gourmet burger, steam rising, wood table, professional food photography, warm lighting' },
    { name: 'Tech & SaaS', prompt: 'futuristic data dashboard, holograms, clean office, neon accents, apple aesthetic' },
    { name: 'Fashion', prompt: 'high-end luxury clothing brand, urban street style, cinematic lighting, vogue magazine aesthetic' },
    { name: 'Health & Fitness', prompt: 'intense gym workout, bodybuilder, sweat, dark cinematic atmosphere, heavy weights' },
    { name: 'Finance', prompt: 'gold coins, stock market charts, elegant office, financial growth, professional' },
    { name: 'Travel', prompt: 'tropical island resort, turquoise water, private jet, luxury vacation, sunset' },
    { name: 'Education', prompt: 'students learning, modern university library, graduation cap, bright future' },
    { name: 'Real Estate', prompt: 'luxury modern villa, swimming pool, glass walls, sunset lighting, architectural masterpiece' },
    { name: 'Beauty & Wellness', prompt: 'organic skincare products, essential oils, spa day, minimalist aesthetic, glowing skin' },
    { name: 'Automotive', prompt: 'sports car speeding, mountain curves, motion blur, supercar, sleek design' },
    { name: 'Gaming', prompt: 'rgb gaming setup, neon lights, esports tournament, futuristic controller, immersive' },
    { name: 'Pet Care', prompt: 'happy golden retriever, high-end dog food, grooming salon, golden hour' },
    { name: 'Healthcare', prompt: 'modern futuristic hospital, expert doctors, high-tech surgery room, medicine box' },
    { name: 'Legal Services', prompt: 'lawyer office, gavel, scale of justice, mahogany desk, premium legal branding' }
];

const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube', 'Twitter/X'];
const styles = ['Instagram Post', 'Facebook Banner', 'Poster', 'Story Size', 'YouTube Thumbnail'];

const titles = [
    'Mega Flash Sale', 'SaaS Growth Secrets', 'Gourmet Dining Experience', 'Premium Menswear Collection',
    '7-Day Fitness Challenge', 'Smart Crypto Investing', 'Maldives Escape 2024', 'Master Coding in 30 Days',
    'The Mansion Collection', 'Organic Glow Skincare', 'Speed Demon 700HP', 'Pro Gaming Gear Setup',
    'Luxury Pet Retreat', 'Smart Health Diagnostics', 'Expert Legal Protection', 'Black Friday Countdown',
    'The Future of AI', 'Artisan Coffee Roasts', 'Streetwear Hype Drop', 'Go Green Initiative',
    'Financial Freedom Roadmap', 'Hidden Gems Travel', 'Spa & Self Care', 'EV Charging Network',
    'Esports Championship', 'Home Yoga Retreat', 'Productivity Masterclass', 'Scaling Your Agency',
    'Wealth Management 2.0', 'Modern Living Spaces', 'Podcast Mastery Course', 'Artisan Bakery Fresh',
    'Digital Nomad Gear', 'Next Gen Console Launch', 'Puppy Nutrition Guide', 'Telehealth Revolution',
    'Corporate Law Experts', 'Summer Festival Tickets', 'Clean Code Principles', 'Sustainable Home Decor',
    'App Launch Playbook', 'Crowdfunding Victory', 'Resolution Kickstart', 'Bridal Fashion Week',
    'Interior Design Trends', 'Web Development 3.0', 'Mindfulness Journey', 'Low Carb Cooking',
    'The Obedient Dog', 'Shop Local Campaign', 'X-treme Sports Gear', 'Executive Leadership'
];

const generateTemplates = () => {
    const templates = [];
    for (let i = 0; i < 52; i++) {
        const indObj = industries[i % industries.length];
        const platform = platforms[i % platforms.length];
        const style = styles[i % styles.length];
        const title = titles[i] || `Business Growth Template #${i + 1}`;

        // Use Pollinations (Our 'Internal' AI Engine fallback) with Model 'Flux'
        // This is deterministic based on the seed, ensuring unique but stable images
        const promptText = `Professional advertisement for a ${indObj.name} business titled "${title}". ${indObj.prompt}. Clean design, ad agency quality, ultra-hd.`;
        const encodedPrompt = encodeURIComponent(promptText);
        const seed = 5000 + i;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

        templates.push({
            title: title,
            platform: platform,
            industry: indObj.name,
            audience: `${indObj.name} enthusiasts, professional buyers, and high-value clients.`,
            description: `A custom-designed AI creative for the "${title}" campaign. Perfectly formatted for ${platform} as a ${style}.`,
            offerDetails: i % 2 === 0 ? 'Limited Time: 40% Off!' : 'Exclusive Launch Offer Available.',
            imageStyle: style,
            hashtags: [indObj.name.toLowerCase().replace(/ & /g, '').replace(/ /g, ''), platform.toLowerCase(), 'aiad', 'business'],
            imageUrl: imageUrl
        });
    }
    return templates;
};

const seedTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Syncing AI Generated Templates...');

        await Template.deleteMany();
        console.log('Database Purged...');

        const templates = generateTemplates();
        await Template.insertMany(templates);
        console.log(`Successfully Synchronized ${templates.length} Business-Specific AI Templates!`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTemplates();
