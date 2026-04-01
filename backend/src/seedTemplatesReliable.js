const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('./models/Template');

dotenv.config();

const industries = [
    { name: 'E-Commerce', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800' },
    { name: 'Food & Beverage', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800' },
    { name: 'Tech & SaaS', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' },
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1539109132374-34fa4ff63b32?auto=format&fit=crop&q=80&w=800' },
    { name: 'Health & Fitness', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800' },
    { name: 'Finance', image: 'https://images.unsplash.com/photo-1611974714028-ac7443101d75?auto=format&fit=crop&q=80&w=800' },
    { name: 'Travel', image: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?auto=format&fit=crop&q=80&w=800' },
    { name: 'Education', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800' },
    { name: 'Real Estate', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800' },
    { name: 'Beauty & Wellness', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Automotive', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800' },
    { name: 'Gaming', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
    { name: 'Pet Care', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800' },
    { name: 'Healthcare', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800' },
    { name: 'Legal Services', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800' }
];

const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube', 'Twitter/X'];
const styles = ['Instagram Post', 'Facebook Banner', 'Poster', 'Story Size', 'YouTube Thumbnail'];

const titles = [
    'Mega Flash Sale', 'SaaS Growth Secrets', 'Gourmet Dining Experience', 'Premium Menswear Collection',
    '7-Day Fitness Challenge', 'Smart Crypto Investing', 'Maldives Escape 2024', 'Master Coding in 30 Days',
    'The Mansion Collection', 'Organic Glow Skincare', 'Speed Demon 700HP', 'Pro Gaming Gear Setup',
    'Luxury Pet Retreat', 'Smart Health Diagnostics', 'Expert Legal Protection', 'Black Friday Countdown'
];

const generateTemplates = () => {
    const templates = [];
    for (let i = 0; i < 52; i++) {
        const indObj = industries[i % industries.length];
        const platform = platforms[i % platforms.length];
        const style = styles[i % styles.length];
        const title = titles[i % titles.length] || `Business Growth Template #${i + 1}`;

        // Using high-reliability Unsplash links for now to ensure all users can see them
        // While keeping the AI-generation capability in the adRequest section.
        const imageUrl = `${indObj.image}&sig=${i}`;

        templates.push({
            title: title,
            platform: platform,
            industry: indObj.name,
            audience: `${indObj.name} Professional Audience`,
            description: `Template for ${title} on ${platform}.`,
            offerDetails: 'Special Offer Available',
            imageStyle: style,
            hashtags: ['ads', indObj.name.toLowerCase().replace(/ /g, '')],
            imageUrl: imageUrl
        });
    }
    return templates;
};

const seedTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Syncing Reliable Image Templates...');
        await Template.deleteMany();
        const templates = generateTemplates();
        await Template.insertMany(templates);
        console.log(`Successfully Seeded ${templates.length} Templates!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTemplates();
