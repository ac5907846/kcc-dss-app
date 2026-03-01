import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/kcc-dss-app/',
})
```

Save the file.

**Step 4: Install deployment tool**

Back in your terminal (make sure you're in the `kcc-dss-app` folder):
```
npm install gh-pages --save-dev