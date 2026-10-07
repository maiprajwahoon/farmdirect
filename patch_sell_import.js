const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/app/(tabs)/sell.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import React, \{ useState, useMemo \} from 'react';/,
  "import React, { useState, useMemo, useEffect } from 'react';"
);

fs.writeFileSync(file, content);
console.log('done');
