const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { CollaborationProject, CollaborationRequest } = require('../models/Collaboration');
const { generateFingerprint } = require('./fingerprint');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('🌱 Database ready for seeding...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // Creators / Users data
    const rawUsers = [
      {
        name: 'Elena Hayes',
        email: 'elena@example.com',
        passwordHash,
        role: 'creator',
        bio: 'Senior Software Architect & Technical Author with 12+ years experience building hyperscale distributed cloud infrastructure.',
        skills: ['Microservices', 'Distributed Systems', 'Cloud Architecture', 'SaaS'],
        location: 'San Francisco, CA',
        website: 'https://elenahayes.tech',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        isIdentityVerified: true,
        totalEarnings: 12450.00,
        rating: 4.9,
        ratingCount: 38,
      },
      {
        name: 'M. R. Vance',
        email: 'marcus@example.com',
        passwordHash,
        role: 'creator',
        bio: 'Sci-Fi author, worldbuilder, and screenwriter. Creator of multiple award-winning speculative fiction universes.',
        skills: ['Screenwriting', 'Sci-Fi Narrative', 'Worldbuilding', 'Character Design'],
        location: 'Austin, TX',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        website: 'https://mrvance.io',
        isVerified: true,
        rating: 4.8,
        ratingCount: 22,
      },
      {
        name: 'J. Dubois',
        email: 'dubois@example.com',
        passwordHash,
        role: 'creator',
        bio: 'Documentary filmmaker & visual storyteller capturing traditional culinary crafts across Europe.',
        skills: ['Cinematography', 'Directing', 'Color Grading', 'Documentary'],
        location: 'Lyon, France',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        rating: 4.9,
        ratingCount: 14,
      },
      {
        name: 'Quant Group',
        email: 'quant@example.com',
        passwordHash,
        role: 'creator',
        bio: 'Algorithmic trading firm and quantitative market research think-tank.',
        skills: ['Quantitative Finance', 'Machine Learning', 'Market Analysis'],
        location: 'London, UK',
        avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        rating: 5.0,
        ratingCount: 19,
      },
      {
        name: 'Dr. Aris',
        email: 'aris@example.com',
        passwordHash,
        role: 'creator',
        bio: 'Acoustic architect and urban researcher exploring sound landscapes.',
        skills: ['Acoustics', 'Audio Recording', 'Architecture', 'Interviewing'],
        location: 'Cambridge, UK',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        rating: 4.9,
        ratingCount: 16,
      },
      {
        name: 'Creativity Admin',
        email: 'admin@creativity.io',
        passwordHash,
        role: 'admin',
        bio: 'Head of Creativity platform moderation and verification operations.',
        skills: ['Platform Management', 'Content Verification', 'System Oversight'],
        location: 'Creativity HQ',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        isIdentityVerified: true,
      },
      {
        name: 'Admin System',
        email: 'admin@narrativeengine.io',
        passwordHash,
        role: 'admin',
        bio: 'Legacy admin account.',
        skills: ['Platform Management', 'Content Verification'],
        location: 'Antigravity HQ',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        isIdentityVerified: true,
      }
    ];

    const usersMap = {};
    for (const u of rawUsers) {
      let user = await User.scope('withPassword').findOne({ where: { email: u.email } });
      if (!user) {
        user = await User.create(u);
      } else {
        await user.update(u);
      }
      usersMap[u.email] = user;
    }

    const elena = usersMap['elena@example.com'];
    const marcus = usersMap['marcus@example.com'];
    const dubois = usersMap['dubois@example.com'];
    const quant = usersMap['quant@example.com'];
    const aris = usersMap['aris@example.com'];

    // Seed Listings matching Screenshots
    const listingsData = [
      {
        creatorId: elena.id,
        title: 'The Silicon Blueprint',
        summary: 'A comprehensive architectural guide to scaling SaaS platforms, detailing microservices, event-driven pipelines, and multi-region resilience.',
        description: `This complete architectural dossier outlines battle-tested paradigms for high-concurrency cloud computing:
- Domain-Driven Design (DDD) service boundaries
- Zero-downtime database schema migration workflows
- High-throughput Kafka/EventBridge messaging models
- Multi-cloud disaster recovery architectures and SLA failover specs.`,
        category: 'business',
        mediaType: 'document',
        verificationStatus: 'verified',
        tags: ['Architecture', 'SaaS', 'Microservices', 'Cloud', 'Guide'],
        visibilityTier: 'public',
        transactionTypes: ['buy', 'license'],
        price: 12500,
        licenseTerms: 'Full enterprise commercial implementation license.',
        isFeatured: true,
        coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        viewCount: 4280,
        inquiryCount: 39,
      },
      {
        creatorId: marcus.id,
        title: 'Echoes in the Valley',
        summary: 'A speculative fiction manuscript... exploring the psychological isolation of remote terraforming engineers on Titan.',
        description: `Full completed novel manuscript (95,000 words) accompanied by a deep-lore series bible and screenplay pitch deck:
- Complete scene-by-scene beat breakdown
- Comprehensive character psychology dossiers
- Concept illustration guides for environment design.`,
        category: 'fiction',
        mediaType: 'document',
        verificationStatus: 'verified',
        tags: ['Fiction', 'Sci-Fi', 'Manuscript', 'Novel', 'Space'],
        visibilityTier: 'public',
        transactionTypes: ['buy', 'license', 'invest'],
        price: 3200,
        licenseTerms: 'Exclusive world English publishing rights.',
        isFeatured: true,
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
        viewCount: 2840,
        inquiryCount: 26,
      },
      {
        creatorId: dubois.id,
        title: "The Artisan's Bread",
        summary: 'A cinematic documentary series capturing centuries-old sourdough fermentation traditions in rural France.',
        description: `Cinematic 4K Master footage package:
- 4-part mastercut series with raw ProRes 4444 rushes
- High fidelity atmospheric soundscapes & acoustic foley
- Complete master distribution rights and festival clearances.`,
        category: 'stories',
        mediaType: 'video',
        verificationStatus: 'reviewing',
        tags: ['Documentary', 'Cinematic', 'Food', 'Culture', '4K Video'],
        visibilityTier: 'public',
        transactionTypes: ['buy', 'license'],
        price: 8500,
        coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
        viewCount: 1620,
        inquiryCount: 14,
      },
      {
        creatorId: quant.id,
        title: 'Algorithmic Wealth',
        summary: 'A detailed whitepaper & execution engine for statistical arbitrage across multi-exchange liquidity pools.',
        description: `A 68-page algorithmic whitepaper and simulation backtester code:
- Statistical volatility spread estimation models
- Slippage minimization heuristics in high-frequency order books
- Fully validated backtesting benchmarks from 2021-2026.`,
        category: 'business',
        mediaType: 'document',
        verificationStatus: 'verified',
        tags: ['Finance', 'Algorithms', 'Whitepaper', 'Quant', 'Trading'],
        visibilityTier: 'public',
        transactionTypes: ['buy', 'license'],
        price: 25000,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        viewCount: 5120,
        inquiryCount: 47,
      },
      {
        creatorId: elena.id,
        title: 'Urban Soundscapes Vol. 1',
        summary: 'High quality field recordings from global metropolitan centers at dawn and dusk.',
        description: '96kHz/24-bit lossless acoustic master recordings suited for ambient game audio, sound design, and film scoring.',
        category: 'creative',
        mediaType: 'audio',
        verificationStatus: 'verified',
        tags: ['Audio', 'Field Recording', 'Foley', 'Soundscape'],
        visibilityTier: 'public',
        price: 45.00,
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        viewCount: 890,
        inquiryCount: 12,
      },
      {
        creatorId: elena.id,
        title: 'Cinematic Drone Footage',
        summary: '4K aerial shots of coastline, dramatic cliffs, and ocean swells captured at golden hour.',
        description: 'DCI 4K 60fps RAW drone footage with D-Log color profiles, stabilized and ready for broadcast integration.',
        category: 'creative',
        mediaType: 'video',
        verificationStatus: 'reviewing',
        tags: ['Video', 'Drone', 'Coastline', '4K', 'Aerial'],
        visibilityTier: 'public',
        price: 120.00,
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        viewCount: 640,
        inquiryCount: 8,
      },
      {
        creatorId: elena.id,
        title: 'Minimalist UI Kit',
        summary: 'Vector design system files with 120+ components, responsive layouts, and modern token architecture.',
        description: 'Comprehensive Figma & SVG UI design system including typography scale, dark/light theme tokens, and accessible interactive primitives.',
        category: 'designs',
        mediaType: 'document',
        verificationStatus: 'archived',
        tags: ['Design', 'UI Kit', 'Figma', 'Design System'],
        visibilityTier: 'public',
        price: 89.00,
        coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
        viewCount: 1450,
        inquiryCount: 19,
      }
    ];

    for (const data of listingsData) {
      const existing = await Listing.findOne({ where: { title: data.title } });
      const { fingerprint, fingerprintedAt } = generateFingerprint(`${data.title}::${data.description}::${data.creatorId}`);
      if (!existing) {
        await Listing.create({
          ...data,
          fingerprint,
          fingerprintedAt,
        });
      } else {
        await existing.update({
          ...data,
          fingerprint,
          fingerprintedAt,
        });
      }
    }

    // Seed Collaboration Projects
    const collabProjectsData = [
      {
        creatorId: marcus.id,
        title: 'Neon Genesis Adaptation',
        roleNeeded: 'Looking for Director',
        projectGoal: 'Secure attachment for studio pitching next quarter.',
        requiredSkills: ['Directing', 'Visual Effects', 'Pitching'],
        description: 'A grounded, neo-noir approach to a classic sci-fi property. Seeking a visionary director experienced in high-concept visuals and atmospheric pacing.',
        category: 'Screenplay & Film',
        isSaved: true
      },
      {
        creatorId: aris.id,
        title: 'The Architecture of Silence',
        roleNeeded: 'Seeking Co-Host',
        projectGoal: 'Record 6-episode pilot season independently.',
        requiredSkills: ['Audio Recording', 'Architecture', 'Interviewing'],
        description: 'An investigative podcast exploring the intersection of modern design, brutalist acoustics, and human psychology.',
        category: 'Audio & Podcast',
        isSaved: false
      },
      {
        creatorId: elena.id,
        title: 'Algorithmic Canvas UI Framework',
        roleNeeded: 'Seeking Lead Frontend Architect',
        projectGoal: 'Ship open-source v1.0 and enterprise add-ons on Creativity.',
        requiredSkills: ['React', 'WebGL / Canvas', 'Design Systems', 'Performance'],
        description: 'An infinite multi-agent creative canvas for teams combining generative AI with real-time vector editing.',
        category: 'AI & Software',
        isSaved: false
      }
    ];

    for (const cp of collabProjectsData) {
      const existing = await CollaborationProject.findOne({ where: { title: cp.title } });
      if (!existing) {
        await CollaborationProject.create(cp);
      } else {
        await existing.update(cp);
      }
    }

    // Seed Collaboration Requests (Inbox)
    const neonProject = await CollaborationProject.findOne({ where: { title: 'Neon Genesis Adaptation' } });
    const requestsData = [
      {
        projectId: neonProject ? neonProject.id : null,
        senderName: 'Sarah Jenkins',
        senderRole: 'VFX Director & Producer',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        message: 'Interested in the Director position for Neon Genesis Adaptation. I have extensive experience in sci-fi indie features and visual effects supervision with studio attachments.',
        timeAgo: '2h ago',
        status: 'pending'
      },
      {
        projectId: null,
        senderName: 'Marcus Chen',
        senderRole: 'Senior Acoustic Engineer',
        senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        message: 'Regarding Architecture of Silence podcast. I recently retired from Firm XYZ and would love to co-host, provide binaural recordings, and share spatial acoustic datasets.',
        timeAgo: '1d ago',
        status: 'pending'
      }
    ];

    for (const reqData of requestsData) {
      const existingReq = await CollaborationRequest.findOne({ where: { senderName: reqData.senderName } });
      if (!existingReq) {
        await CollaborationRequest.create(reqData);
      }
    }

    console.log('✅ Sample listings, users, projects, and inbox requests seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Done!');
    process.exit(0);
  });
}

module.exports = seedDatabase;
