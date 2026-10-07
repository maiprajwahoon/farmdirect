const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/app/(tabs)/sell.tsx');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { useEffect }')) {
  content = content.replace("import { useState, useMemo } from 'react';", "import { useState, useMemo, useEffect } from 'react';");
}

if (!content.includes('fetchServerListings()')) {
  content = content.replace(
    /const \{ listings \} = useMarketStore\(\);/g,
    `const { listings, fetchServerListings } = useMarketStore();
  
  useEffect(() => {
    fetchServerListings();
  }, [fetchServerListings]);`
  );
}

fs.writeFileSync(file, content);
console.log('done');
