/**
 * Vite plugin to load goal files at build time
 * 
 * This plugin reads markdown files from the Goals directory and creates
 * a virtual module with all the goal data, so it can be used at runtime.
 */

import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

interface GoalFile {
  path: string;
  category: string;
  content: string;
}

const VIRTUAL_MODULE_ID = 'virtual:goals';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export function goalsPlugin(goalsPath: string): Plugin {
  return {
    name: 'vite-plugin-goals',
    
    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },
    
    load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const goalFiles = readGoalFiles(goalsPath);
        
        return `
          export const goalFiles = ${JSON.stringify(goalFiles, null, 2)};
        `;
      }
    },
    
    // Hot reload when goal files change
    handleHotUpdate({ file, server }) {
      if (file.includes('Goals') && file.endsWith('.md')) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          return [mod];
        }
      }
    },

    configureServer(server) {
      // Watch the goals directory which is outside the root
      const absoluteGoalsPath = path.resolve(process.cwd(), goalsPath);
      server.watcher.add(absoluteGoalsPath);

      server.middlewares.use('/api/save-goal', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { filePath, content } = JSON.parse(body);
              
              // filePath is relative to goals directory (e.g. "YouTube/MyGoal.md")
              const absoluteGoalsPath = path.resolve(process.cwd(), goalsPath);
              const targetPath = path.join(absoluteGoalsPath, filePath);
              
              // Simple safety check
              if (!targetPath.startsWith(absoluteGoalsPath)) {
                res.statusCode = 403;
                res.end(JSON.stringify({ error: 'Access denied' }));
                return;
              }
              
              fs.writeFileSync(targetPath, content, 'utf-8');
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              console.error('Error saving goal:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

function readGoalFiles(goalsPath: string): GoalFile[] {
  const absolutePath = path.resolve(process.cwd(), goalsPath);
  const goalFiles: GoalFile[] = [];
  
  if (!fs.existsSync(absolutePath)) {
    console.warn(`Goals directory not found: ${absolutePath}`);
    return [];
  }
  
  // Read all category directories
  const categories = fs.readdirSync(absolutePath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const category of categories) {
    const categoryPath = path.join(absolutePath, category);
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      goalFiles.push({
        path: `${category}/${file}`,
        category,
        content,
      });
    }
  }
  

  return goalFiles;
}

export default goalsPlugin;
