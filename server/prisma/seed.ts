import { PrismaClient, UserRole, SupplierStatus, ImportStatus, InventoryCategory, MatchStatus, DecisionType, DecisionEntityType, CanonicalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sangam database seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.rankingResult.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.supplierVariantListing.deleteMany();
  await prisma.canonicalVariant.deleteMany();
  await prisma.matchDecision.deleteMany();
  await prisma.supplierListing.deleteMany();
  await prisma.canonicalEntity.deleteMany();
  await prisma.inventoryImport.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const analystHash = await bcrypt.hash('Analyst@123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@sangam.travel',
      name: 'Aditi Sharma (Admin)',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@sangam.travel',
      name: 'Vikram Mehta (Analyst)',
      passwordHash: analystHash,
      role: UserRole.ANALYST,
    },
  });

  console.log(`✅ Seeded 2 users: ${admin.email}, ${analyst.email}`);

  // 3. Suppliers
  const bookingBridge = await prisma.supplier.create({
    data: {
      code: 'SUP-BOOKINGBRIDGE',
      name: 'BookingBridge Global',
      contactEmail: 'api@bookingbridge.net',
      status: SupplierStatus.ACTIVE,
      reliabilityScore: 0.94,
      apiEndpoint: 'https://api.bookingbridge.net/v2/inventory',
      metadata: { connectionType: 'REST/JSON', refreshIntervalMinutes: 30 },
    },
  });

  const globalBedBank = await prisma.supplier.create({
    data: {
      code: 'SUP-GLOBALBEDBANK',
      name: 'GlobalBedBank B2B',
      contactEmail: 'connect@globalbedbank.com',
      status: SupplierStatus.ACTIVE,
      reliabilityScore: 0.88,
      apiEndpoint: 'https://xml.globalbedbank.com/ota',
      metadata: { connectionType: 'XML/OTA', refreshIntervalMinutes: 60 },
    },
  });

  const directConnect = await prisma.supplier.create({
    data: {
      code: 'SUP-DIRECTCONNECT',
      name: 'DirectConnect Hospitality',
      contactEmail: 'partners@directconnect.travel',
      status: SupplierStatus.ACTIVE,
      reliabilityScore: 0.91,
      apiEndpoint: 'https://api.directconnect.travel/pms',
      metadata: { connectionType: 'GraphQL', refreshIntervalMinutes: 15 },
    },
  });

  const tourNet = await prisma.supplier.create({
    data: {
      code: 'SUP-TOURNET',
      name: 'TourNet Experiences',
      contactEmail: 'supply@tournet.io',
      status: SupplierStatus.ACTIVE,
      reliabilityScore: 0.92,
      apiEndpoint: 'https://api.tournet.io/v1/activities',
      metadata: { vertical: 'SIGHTSEEING', currency: 'USD' },
    },
  });

  const experienceHub = await prisma.supplier.create({
    data: {
      code: 'SUP-EXPERIENCEHUB',
      name: 'ExperienceHub Global',
      contactEmail: 'integrations@experiencehub.com',
      status: SupplierStatus.ACTIVE,
      reliabilityScore: 0.86,
      apiEndpoint: 'https://api.experiencehub.com/tours',
      metadata: { vertical: 'SIGHTSEEING', currency: 'USD' },
    },
  });

  const activityCentral = await prisma.supplier.create({
    data: {
      code: 'SUP-ACTIVITYCENTRAL',
      name: 'ActivityCentral India',
      contactEmail: 'ops@activitycentral.in',
      status: SupplierStatus.ACTIVE,
      reliabilityScore: 0.82,
      apiEndpoint: 'https://api.activitycentral.in/experiences',
      metadata: { vertical: 'SIGHTSEEING', region: 'India' },
    },
  });

  console.log('✅ Seeded 6 suppliers');

  // 4. Imports
  const hotelImport = await prisma.inventoryImport.create({
    data: {
      supplierId: bookingBridge.id,
      importRef: 'IMP-HTL-202611-001',
      category: InventoryCategory.HOTEL,
      status: ImportStatus.COMPLETED,
      totalRecords: 120,
      processedRecords: 120,
      startedAt: new Date(Date.now() - 3600000 * 2),
      completedAt: new Date(Date.now() - 3600000 * 1.8),
    },
  });

  const sightseeingImport = await prisma.inventoryImport.create({
    data: {
      supplierId: tourNet.id,
      importRef: 'IMP-ACT-202611-002',
      category: InventoryCategory.SIGHTSEEING,
      status: ImportStatus.COMPLETED,
      totalRecords: 45,
      processedRecords: 45,
      startedAt: new Date(Date.now() - 3600000 * 1),
      completedAt: new Date(Date.now() - 3600000 * 0.9),
    },
  });

  // 5. Canonical Entities (Master De-duplicated Products)
  const canonOberoi = await prisma.canonicalEntity.create({
    data: {
      category: InventoryCategory.HOTEL,
      name: 'The Oberoi Grand Kolkata',
      standardizedName: 'oberoi grand kolkata',
      destinationCity: 'Kolkata',
      destinationCountry: 'India',
      latitude: 22.5626,
      longitude: 88.3510,
      starRating: 5.0,
      address: '15 Jawaharlal Nehru Road, New Market Area, Kolkata 700013',
      description: 'The Grande Dame of Chowringhee, colonial heritage luxury hotel featuring classical neoclassical architecture and lush garden courtyards.',
      attributes: {
        pool: true,
        spa: true,
        fitnessCenter: true,
        restaurantsCount: 3,
        heritageYear: 1887,
      },
      status: CanonicalStatus.ACTIVE,
    },
  });

  const canonTajDelhi = await prisma.canonicalEntity.create({
    data: {
      category: InventoryCategory.HOTEL,
      name: 'Taj Palace New Delhi',
      standardizedName: 'taj palace new delhi',
      destinationCity: 'New Delhi',
      destinationCountry: 'India',
      latitude: 28.5985,
      longitude: 77.1725,
      starRating: 5.0,
      address: '2 Sardar Patel Marg, Diplomatic Enclave, New Delhi 110021',
      description: 'Sprawled over 6 acres of lush gardens in the prestigious Diplomatic Enclave with award-winning fine dining.',
      attributes: {
        pool: true,
        ballroom: true,
        conventionCenter: true,
        restaurantsCount: 4,
      },
      status: CanonicalStatus.ACTIVE,
    },
  });

  const canonVictoria = await prisma.canonicalEntity.create({
    data: {
      category: InventoryCategory.SIGHTSEEING,
      name: 'Victoria Memorial Kolkata',
      standardizedName: 'victoria memorial kolkata',
      destinationCity: 'Kolkata',
      destinationCountry: 'India',
      latitude: 22.5448,
      longitude: 88.3426,
      address: 'Victoria Memorial Hall, Queens Way, Kolkata 700071',
      description: 'Iconic white marble museum and monument dedicated to Queen Victoria, surrounded by 64 acres of manicured gardens.',
      attributes: {
        estimatedDurationHours: 2.5,
        accessType: 'ENTRY_TICKET',
        wheelchairAccessible: true,
      },
      status: CanonicalStatus.ACTIVE,
    },
  });

  const canonSundarbans = await prisma.canonicalEntity.create({
    data: {
      category: InventoryCategory.SIGHTSEEING,
      name: 'Sundarbans National Park Boat Tour',
      standardizedName: 'sundarbans boat tour',
      destinationCity: 'Sundarbans',
      destinationCountry: 'India',
      latitude: 22.1643,
      longitude: 88.7562,
      address: 'Godkhali Jetty, Sundarbans Tiger Reserve, West Bengal',
      description: 'UNESCO World Heritage tidal mangrove forest boat safari exploring estuarine waterways, watch towers and wildlife.',
      attributes: {
        estimatedDurationHours: 10.0,
        accessType: 'GUIDED_CRUISE',
        transfersAvailable: true,
      },
      status: CanonicalStatus.ACTIVE,
    },
  });

  console.log('✅ Seeded 4 Canonical Entities');

  // 6. Canonical Variants
  const cvOberoiDeluxe = await prisma.canonicalVariant.create({
    data: {
      canonicalEntityId: canonOberoi.id,
      category: InventoryCategory.HOTEL,
      name: 'Deluxe King Heritage Room',
      standardCode: 'DLX-KNG-COURTYARD',
      description: 'Standard luxury king bedroom facing serene courtyard.',
      attributes: { bedType: 'KING', maxOccupancy: 2, sizeSqM: 38 },
    },
  });

  const cvTajSuperior = await prisma.canonicalVariant.create({
    data: {
      canonicalEntityId: canonTajDelhi.id,
      category: InventoryCategory.HOTEL,
      name: 'Superior King Room',
      standardCode: 'SUP-KNG-GARDEN',
      description: 'Superior room with lush Diplomatic Enclave garden view.',
      attributes: { bedType: 'KING', maxOccupancy: 2, sizeSqM: 40 },
    },
  });

  const cvVictoriaEntry = await prisma.canonicalVariant.create({
    data: {
      canonicalEntityId: canonVictoria.id,
      category: InventoryCategory.SIGHTSEEING,
      name: 'General Admission & Museum Pass',
      standardCode: 'ADM-GEN-MUSEUM',
      description: 'Entry ticket for monument gallery and grounds.',
      attributes: { includesAudioGuide: false, skipTheLine: false },
    },
  });

  const cvSundarbansDayTour = await prisma.canonicalVariant.create({
    data: {
      canonicalEntityId: canonSundarbans.id,
      category: InventoryCategory.SIGHTSEEING,
      name: 'Full Day Mangrove Boat Safari',
      standardCode: 'ACT-SAFARI-DAY',
      description: 'All-day guided cruise with forest entry permits and meals.',
      attributes: { includesLunch: true, includesPermits: true },
    },
  });

  // 7. Supplier Listings (Showing Variations across Suppliers!)
  // Oberoi Kolkata - Supplier 1 (BookingBridge)
  const slOberoiBB = await prisma.supplierListing.create({
    data: {
      supplierId: bookingBridge.id,
      importId: hotelImport.id,
      canonicalEntityId: canonOberoi.id,
      externalId: 'BB-HTL-77401',
      category: InventoryCategory.HOTEL,
      rawName: 'The Oberoi Grand Kolkata',
      normalizedName: 'oberoi grand kolkata',
      rawAddress: '15 Jawaharlal Nehru Road, New Market Area',
      city: 'Kolkata',
      country: 'India',
      latitude: 22.5626,
      longitude: 88.3510,
      starRating: 5.0,
      rawDescription: 'Colonial-era luxury heritage hotel situated in the heart of Kolkata with grand architecture.',
      rawData: { source: 'synthetic_dataset', externalId: 'BB-HTL-77401' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9850,
    },
  });

  // Oberoi Kolkata - Supplier 2 (GlobalBedBank)
  const slOberoiGBB = await prisma.supplierListing.create({
    data: {
      supplierId: globalBedBank.id,
      externalId: 'GBB-108422',
      category: InventoryCategory.HOTEL,
      rawName: 'The Oberoi Grand, Kolkata',
      normalizedName: 'oberoi grand kolkata',
      rawAddress: '15, J.L. Nehru Rd, Esplanade, Dharmatala',
      city: 'Kolkata',
      country: 'India',
      latitude: 22.5627,
      longitude: 88.3511,
      starRating: 5.0,
      rawDescription: '5-star historic hotel in central Kolkata offering Victorian elegance and world-class dining.',
      rawData: { source: 'synthetic_dataset', externalId: 'GBB-108422' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9620,
    },
  });

  // Oberoi Kolkata - Supplier 3 (DirectConnect)
  const slOberoiDC = await prisma.supplierListing.create({
    data: {
      supplierId: directConnect.id,
      externalId: 'DC-IND-00439',
      category: InventoryCategory.HOTEL,
      rawName: 'Oberoi Grand Hotel',
      normalizedName: 'oberoi grand',
      rawAddress: 'Jawaharlal Nehru Road, Kolkata',
      city: 'Kolkata',
      country: 'India',
      latitude: 22.5625,
      longitude: 88.3509,
      starRating: 5.0,
      rawDescription: 'Palatial grandeur known as the Grande Dame of Chowringhee.',
      rawData: { source: 'synthetic_dataset', externalId: 'DC-IND-00439' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9410,
    },
  });

  // Taj Palace Delhi - Supplier 1 (BookingBridge)
  const slTajDelhiBB = await prisma.supplierListing.create({
    data: {
      supplierId: bookingBridge.id,
      importId: hotelImport.id,
      canonicalEntityId: canonTajDelhi.id,
      externalId: 'BB-HTL-88204',
      category: InventoryCategory.HOTEL,
      rawName: 'Taj Palace New Delhi',
      normalizedName: 'taj palace new delhi',
      rawAddress: '2 Sardar Patel Marg, Diplomatic Enclave',
      city: 'New Delhi',
      country: 'India',
      latitude: 28.5985,
      longitude: 77.1725,
      starRating: 5.0,
      rawDescription: 'Sprawled over 6 acres of lush green lawns in New Delhi Diplomatic Enclave.',
      rawData: { source: 'synthetic_dataset', externalId: 'BB-HTL-88204' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9910,
    },
  });

  // Taj Palace Delhi - Supplier 2 (GlobalBedBank)
  const slTajDelhiGBB = await prisma.supplierListing.create({
    data: {
      supplierId: globalBedBank.id,
      externalId: 'GBB-209118',
      category: InventoryCategory.HOTEL,
      rawName: 'Taj Palace, Delhi',
      normalizedName: 'taj palace delhi',
      rawAddress: 'Sardar Patel Marg, Chanakyapuri',
      city: 'New Delhi',
      country: 'India',
      latitude: 28.5986,
      longitude: 77.1726,
      starRating: 5.0,
      rawDescription: 'Luxury palace hotel in central diplomatic area.',
      rawData: { source: 'synthetic_dataset', externalId: 'GBB-209118' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9540,
    },
  });

  // Taj Bengal Kolkata (GENUINELY DIFFERENT PRODUCT - Candidate flagged for review!)
  const slTajBengal = await prisma.supplierListing.create({
    data: {
      supplierId: bookingBridge.id,
      importId: hotelImport.id,
      canonicalEntityId: null, // UNCONFIRMED
      externalId: 'BB-HTL-99312',
      category: InventoryCategory.HOTEL,
      rawName: 'Taj Bengal Kolkata',
      normalizedName: 'taj bengal kolkata',
      rawAddress: '34B Belvedere Road, Alipore',
      city: 'Kolkata',
      country: 'India',
      latitude: 22.5360,
      longitude: 88.3320,
      starRating: 5.0,
      rawDescription: 'Distinctive landmark hotel located in upscale Alipore Kolkata. Distinct from Taj Palace Delhi.',
      rawData: { source: 'synthetic_dataset', externalId: 'BB-HTL-99312' },
      matchStatus: MatchStatus.REVIEW_REQUIRED,
      matchConfidence: 0.6800,
    },
  });

  // Sightseeing 1: Victoria Memorial (TourNet)
  const slVictoriaTN = await prisma.supplierListing.create({
    data: {
      supplierId: tourNet.id,
      importId: sightseeingImport.id,
      canonicalEntityId: canonVictoria.id,
      externalId: 'TN-ACT-1001',
      category: InventoryCategory.SIGHTSEEING,
      rawName: 'Victoria Memorial Kolkata',
      normalizedName: 'victoria memorial kolkata',
      rawAddress: 'Victoria Memorial, Queens Way',
      city: 'Kolkata',
      country: 'India',
      latitude: 22.5448,
      longitude: 88.3426,
      rawDescription: 'Historical British colonial marble monument with museum galleries.',
      rawData: { source: 'synthetic_dataset', externalId: 'TN-ACT-1001' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9780,
    },
  });

  // Sightseeing 1 variation: Victoria Memorial Hall (ExperienceHub)
  const slVictoriaEH = await prisma.supplierListing.create({
    data: {
      supplierId: experienceHub.id,
      externalId: 'EH-EXP-5520',
      category: InventoryCategory.SIGHTSEEING,
      rawName: 'Victoria Memorial Hall Guided Tour',
      normalizedName: 'victoria memorial hall',
      rawAddress: 'Queens Way, Maidan, Kolkata',
      city: 'Kolkata',
      country: 'India',
      latitude: 22.5449,
      longitude: 88.3427,
      rawDescription: 'Guided walking tour through Victoria Memorial Hall museum and gardens.',
      rawData: { source: 'synthetic_dataset', externalId: 'EH-EXP-5520' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9450,
    },
  });

  // Sightseeing 2: Sundarbans boat tour (TourNet)
  const slSundarbansTN = await prisma.supplierListing.create({
    data: {
      supplierId: tourNet.id,
      importId: sightseeingImport.id,
      canonicalEntityId: canonSundarbans.id,
      externalId: 'TN-ACT-2004',
      category: InventoryCategory.SIGHTSEEING,
      rawName: 'Sundarbans boat tour',
      normalizedName: 'sundarbans boat',
      rawAddress: 'Godkhali Ghat, Sundarbans National Park',
      city: 'Sundarbans',
      country: 'India',
      latitude: 22.1643,
      longitude: 88.7562,
      rawDescription: 'Day cruise through mangrove channels, tiger reserve watch towers and village walk.',
      rawData: { source: 'synthetic_dataset', externalId: 'TN-ACT-2004' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9320,
    },
  });

  // Sightseeing 2 variation: Sundarbans mangrove cruise (ActivityCentral)
  const slSundarbansAC = await prisma.supplierListing.create({
    data: {
      supplierId: activityCentral.id,
      externalId: 'AC-EXP-8891',
      category: InventoryCategory.SIGHTSEEING,
      rawName: 'Sundarbans mangrove cruise',
      normalizedName: 'sundarbans mangrove',
      rawAddress: 'Canning / Godkhali, West Bengal',
      city: 'Sundarbans',
      country: 'India',
      latitude: 22.1645,
      longitude: 88.7565,
      rawDescription: 'Guided mangrove boat safari across Sajnekhali and Sudhanyakhali watch towers.',
      rawData: { source: 'synthetic_dataset', externalId: 'AC-EXP-8891' },
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9100,
    },
  });

  // Sightseeing Distinct Product: Belur Math (TourNet) - flagged for review
  const slBelurMath = await prisma.supplierListing.create({
    data: {
      supplierId: tourNet.id,
      importId: sightseeingImport.id,
      canonicalEntityId: null, // Distinct attraction
      externalId: 'TN-ACT-4009',
      category: InventoryCategory.SIGHTSEEING,
      rawName: 'Belur Math Spiritual & Cultural Tour',
      normalizedName: 'belur math spiritual cultural',
      rawAddress: 'Belur, Howrah',
      city: 'Kolkata',
      country: 'India',
      latitude: 22.6315,
      longitude: 88.3547,
      rawDescription: 'Headquarters of Ramakrishna Math located on Hooghly river. Distinct product.',
      rawData: { source: 'synthetic_dataset', externalId: 'TN-ACT-4009' },
      matchStatus: MatchStatus.REVIEW_REQUIRED,
      matchConfidence: 0.5820,
    },
  });

  console.log('✅ Seeded 11 Supplier Listings across 6 suppliers');

  // 8. Supplier Variant Listings & Offers
  // Oberoi BB Variant
  const svlOberoiBB = await prisma.supplierVariantListing.create({
    data: {
      supplierListingId: slOberoiBB.id,
      canonicalVariantId: cvOberoiDeluxe.id,
      externalVariantId: 'BB-VAR-77401-DLX',
      rawName: 'Deluxe King Heritage Room',
      normalizedName: 'deluxe king heritage room',
      rawDescription: 'Spacious king bed room overlooking the courtyard pool.',
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9900,
    },
  });

  const offerOberoiBB = await prisma.offer.create({
    data: {
      supplierVariantListingId: svlOberoiBB.id,
      currency: 'USD',
      basePrice: 145.00,
      netPrice: 130.00,
      taxAmount: 15.00,
      availabilityCount: 4,
      cancellationPolicy: { refundable: true, deadlineHours: 48, penalty: 0 },
      mealPlan: 'Bed & Breakfast',
      transferIncluded: false,
      inclusions: ['Buffet Breakfast', 'High-speed Wi-Fi', 'Pool Access'],
      bookingConditions: 'Standard 48-hr free cancellation.',
    },
  });

  // Oberoi GBB Variant
  const svlOberoiGBB = await prisma.supplierVariantListing.create({
    data: {
      supplierListingId: slOberoiGBB.id,
      canonicalVariantId: cvOberoiDeluxe.id,
      externalVariantId: 'GBB-VAR-108422-KNG',
      rawName: 'Deluxe Room, 1 King Bed',
      normalizedName: 'deluxe room 1 king bed',
      rawDescription: 'Classic colonial decor with modern luxury amenities.',
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9200,
    },
  });

  const offerOberoiGBB = await prisma.offer.create({
    data: {
      supplierVariantListingId: svlOberoiGBB.id,
      currency: 'USD',
      basePrice: 140.00,
      netPrice: 122.00,
      taxAmount: 18.00,
      availabilityCount: 2,
      cancellationPolicy: { refundable: true, deadlineHours: 24, penalty: 0 },
      mealPlan: 'Room Only',
      transferIncluded: true,
      inclusions: ['Airport One-Way Transfer', 'Complimentary Tea/Coffee'],
      bookingConditions: '24-hour flexible cancellation with transfer.',
    },
  });

  // Oberoi DC Variant
  const svlOberoiDC = await prisma.supplierVariantListing.create({
    data: {
      supplierListingId: slOberoiDC.id,
      canonicalVariantId: cvOberoiDeluxe.id,
      externalVariantId: 'DC-VAR-00439-HERITAGE',
      rawName: 'Heritage Deluxe King',
      normalizedName: 'heritage deluxe king',
      rawDescription: 'Courtyard view deluxe room with marble bath.',
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9400,
    },
  });

  const offerOberoiDC = await prisma.offer.create({
    data: {
      supplierVariantListingId: svlOberoiDC.id,
      currency: 'USD',
      basePrice: 155.00,
      netPrice: 135.00,
      taxAmount: 20.00,
      availabilityCount: 1,
      cancellationPolicy: { refundable: false, deadlineHours: 0, penalty: 135 },
      mealPlan: 'Bed & Breakfast',
      transferIncluded: false,
      inclusions: ['Breakfast Included', 'Heritage Walk Session'],
      bookingConditions: 'Non-refundable promotional rate.',
    },
  });

  // Taj Delhi BB Variant & Offer
  const svlTajDelhiBB = await prisma.supplierVariantListing.create({
    data: {
      supplierListingId: slTajDelhiBB.id,
      canonicalVariantId: cvTajSuperior.id,
      externalVariantId: 'BB-VAR-88204-SUP',
      rawName: 'Superior Room King Bed',
      normalizedName: 'superior room king bed',
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9800,
    },
  });

  await prisma.offer.create({
    data: {
      supplierVariantListingId: svlTajDelhiBB.id,
      currency: 'USD',
      basePrice: 210.00,
      netPrice: 185.00,
      taxAmount: 25.00,
      availabilityCount: 5,
      cancellationPolicy: { refundable: true, deadlineHours: 48, penalty: 0 },
      mealPlan: 'Breakfast Included',
      transferIncluded: true,
      inclusions: ['Express Check-in', 'Daily Buffet Breakfast'],
    },
  });

  // Victoria Memorial Variant & Offer
  const svlVictoriaTN = await prisma.supplierVariantListing.create({
    data: {
      supplierListingId: slVictoriaTN.id,
      canonicalVariantId: cvVictoriaEntry.id,
      externalVariantId: 'TN-VAR-1001-ENTRY',
      rawName: 'General Admission & Museum Ticket',
      normalizedName: 'general admission museum ticket',
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9900,
    },
  });

  await prisma.offer.create({
    data: {
      supplierVariantListingId: svlVictoriaTN.id,
      currency: 'USD',
      basePrice: 8.00,
      netPrice: 6.50,
      taxAmount: 1.50,
      availabilityCount: 50,
      cancellationPolicy: { refundable: true, deadlineHours: 24, penalty: 0 },
      transferIncluded: false,
      inclusions: ['Monument Entry', 'Garden Access'],
    },
  });

  // Sundarbans Variant & Offer
  const svlSundarbansTN = await prisma.supplierVariantListing.create({
    data: {
      supplierListingId: slSundarbansTN.id,
      canonicalVariantId: cvSundarbansDayTour.id,
      externalVariantId: 'TN-VAR-2004-DAY',
      rawName: 'Full Day Mangrove Boat Safari',
      normalizedName: 'full day mangrove boat safari',
      matchStatus: MatchStatus.AUTO_MATCHED,
      matchConfidence: 0.9700,
    },
  });

  await prisma.offer.create({
    data: {
      supplierVariantListingId: svlSundarbansTN.id,
      currency: 'USD',
      basePrice: 55.00,
      netPrice: 45.00,
      taxAmount: 10.00,
      availabilityCount: 12,
      cancellationPolicy: { refundable: true, deadlineHours: 48, penalty: 0 },
      transferIncluded: true,
      inclusions: ['Forest Permits', 'Buffet Lunch', 'Kolkata Pickup & Drop'],
    },
  });

  console.log('✅ Seeded Variants and Bookable Offers');

  // 9. Match Decisions Audit Trail
  await prisma.matchDecision.create({
    data: {
      entityType: DecisionEntityType.ENTITY,
      sourceListingId: slOberoiBB.id,
      targetCanonicalId: canonOberoi.id,
      decision: DecisionType.AUTO_ACCEPT,
      confidenceScore: 0.9850,
      explanation: {
        method: 'RapidFuzz+Haversine',
        nameSimilarity: 0.98,
        geoProximityScore: 1.00,
        distanceKm: 0.00,
      },
      decidedByUserId: admin.id,
    },
  });

  await prisma.matchDecision.create({
    data: {
      entityType: DecisionEntityType.ENTITY,
      sourceListingId: slOberoiGBB.id,
      targetCanonicalId: canonOberoi.id,
      decision: DecisionType.AUTO_ACCEPT,
      confidenceScore: 0.9620,
      explanation: {
        method: 'RapidFuzz+Haversine',
        nameSimilarity: 0.95,
        geoProximityScore: 0.98,
        distanceKm: 0.015,
      },
      decidedByUserId: admin.id,
    },
  });

  // 10. Ranking Results for Oberoi Offers
  await prisma.rankingResult.create({
    data: {
      queryContext: { city: 'Kolkata', roomType: 'Deluxe King', checkIn: '2026-12-01' },
      offerId: offerOberoiGBB.id,
      rankPosition: 1,
      overallScore: 0.8920,
      priceScore: 0.9400,
      reliabilityScore: 0.8800,
      cancellationScore: 0.9500,
      scoreBreakdown: {
        priceAdvantage: '$122 vs $130/$135',
        transferBonus: 'Airport transfer included',
        cancellation: 'Free until 24h before arrival',
      },
    },
  });

  await prisma.rankingResult.create({
    data: {
      queryContext: { city: 'Kolkata', roomType: 'Deluxe King', checkIn: '2026-12-01' },
      offerId: offerOberoiBB.id,
      rankPosition: 2,
      overallScore: 0.8650,
      priceScore: 0.8400,
      reliabilityScore: 0.9400,
      cancellationScore: 0.8500,
      scoreBreakdown: {
        supplierTrust: 'BookingBridge 0.94 reliability',
        mealPlanBonus: 'Buffet breakfast included',
      },
    },
  });

  await prisma.rankingResult.create({
    data: {
      queryContext: { city: 'Kolkata', roomType: 'Deluxe King', checkIn: '2026-12-01' },
      offerId: offerOberoiDC.id,
      rankPosition: 3,
      overallScore: 0.7100,
      priceScore: 0.7600,
      reliabilityScore: 0.9100,
      cancellationScore: 0.2000,
      scoreBreakdown: {
        penalty: 'Non-refundable booking condition',
      },
    },
  });

  console.log('✅ Seeded Match Audit Decisions and Ranking Results');
  console.log('🎉 Sangam database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
