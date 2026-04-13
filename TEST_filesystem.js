class VFS {
    constructor() {
      this.root = {
        name: '/',
        type: 'dir',
        children: {},
        parent: null,
        meta: { created: Date.now() }
      };
      this.currentPath = '/';
    }
  
    // Helper to resolve a path string to a node
    _resolvePath(path) {
      if (path === '/') return this.root;
      
      const parts = path.split('/').filter(p => p.length > 0);
      let current = path.startsWith('/') ? this.root : this._getNodeByPath(this.currentPath);
  
      for (const part of parts) {
        if (part === '..') {
          current = current.parent || current;
        } else if (part !== '.') {
          if (!current.children[part]) return null;
          current = current.children[part];
        }
      }
      return current;
    }
  
    mkdir(path) {
      const parts = path.split('/').filter(p => p.length > 0);
      const dirName = parts.pop();
      const parentPath = path.startsWith('/') ? '/' + parts.join('/') : parts.join('/');
      const parent = this._resolvePath(parentPath || '.');
  
      if (parent && parent.type === 'dir' && !parent.children[dirName]) {
        parent.children[dirName] = {
          name: dirName,
          type: 'dir',
          children: {},
          parent: parent,
          meta: { created: Date.now() }
        };
        return true;
      }
      return false;
    }
  
    writeFile(path, content) {
      const parts = path.split('/').filter(p => p.length > 0);
      const fileName = parts.pop();
      const parent = this._resolvePath(parts.join('/') || '.');
  
      if (parent && parent.type === 'dir') {
        parent.children[fileName] = {
          name: fileName,
          type: 'file',
          content: content,
          parent: parent,
          meta: { updated: Date.now() }
        };
        return true;
      }
      return false;
    }
  
    ls(path = '.') {
      const node = this._resolvePath(path);
      return node && node.type === 'dir' ? Object.keys(node.children) : null;
    }
  }
  
  const vfs = new VFS();
  vfs.mkdir('bin');
  vfs.writeFile('bin/hello.sh', 'echo "Hello World"');
  console.log(vfs.ls('/bin')); // ["hello.sh"]
  