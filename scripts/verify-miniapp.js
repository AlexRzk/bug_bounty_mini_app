#!/usr/bin/env node

/**
 * Farcaster Mini App Verification Script
 * 
 * Checks that your app is properly configured as a Farcaster Mini App
 */

const fs = require('fs');
const path = require('path');

const CHECKS = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function log(type, message) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  console.log(`${icons[type] || icons.info} ${message}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('success', `${description} exists`);
    CHECKS.passed++;
    return true;
  } else {
    log('error', `${description} not found at: ${filePath}`);
    CHECKS.failed++;
    return false;
  }
}

function checkManifest() {
  console.log('\n📋 Checking Manifest...');
  
  const manifestPath = path.join(process.cwd(), 'public', '.well-known', 'farcaster.json');
  
  if (!checkFileExists(manifestPath, 'Farcaster manifest')) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check accountAssociation
    if (manifest.accountAssociation) {
      log('success', 'Account association present');
      CHECKS.passed++;
      
      if (manifest.accountAssociation.header && 
          manifest.accountAssociation.payload && 
          manifest.accountAssociation.signature) {
        log('success', 'Account association has all required fields');
        CHECKS.passed++;
      } else {
        log('error', 'Account association missing required fields');
        CHECKS.failed++;
      }
    } else {
      log('error', 'Account association missing');
      CHECKS.failed++;
    }

    // Check miniapp config
    if (manifest.miniapp || manifest.frame) {
      const config = manifest.miniapp || manifest.frame;
      log('success', `Mini App config present (using "${manifest.miniapp ? 'miniapp' : 'frame'}" field)`);
      CHECKS.passed++;

      // Check version
      if (config.version === '1') {
        log('success', 'Version is correct ("1")');
        CHECKS.passed++;
      } else {
        log('error', `Version should be "1", found: "${config.version}"`);
        CHECKS.failed++;
      }

      // Check required fields
      const requiredFields = ['name', 'description', 'iconUrl', 'homeUrl'];
      requiredFields.forEach(field => {
        if (config[field]) {
          log('success', `${field} is set`);
          CHECKS.passed++;
        } else {
          log('error', `${field} is missing`);
          CHECKS.failed++;
        }
      });

      // Check optional but recommended
      if (config.splashImageUrl && config.splashBackgroundColor) {
        log('success', 'Splash screen configured');
        CHECKS.passed++;
      } else {
        log('warning', 'Splash screen not fully configured (optional but recommended)');
        CHECKS.warnings++;
      }
    } else {
      log('error', 'Mini App config missing (need "miniapp" or "frame" field)');
      CHECKS.failed++;
    }

  } catch (error) {
    log('error', `Failed to parse manifest: ${error.message}`);
    CHECKS.failed++;
  }
}

function checkSDK() {
  console.log('\n📦 Checking SDK Installation...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!checkFileExists(packageJsonPath, 'package.json')) {
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps['@farcaster/miniapp-sdk']) {
      log('success', `Mini App SDK installed (${deps['@farcaster/miniapp-sdk']})`);
      CHECKS.passed++;
    } else {
      log('error', 'Mini App SDK not installed');
      CHECKS.failed++;
    }

    if (deps['@farcaster/frame-sdk']) {
      log('warning', 'Old frame-sdk still present, should be removed');
      CHECKS.warnings++;
    }
  } catch (error) {
    log('error', `Failed to parse package.json: ${error.message}`);
    CHECKS.failed++;
  }
}

function checkComponents() {
  console.log('\n🧩 Checking Components...');
  
  checkFileExists(
    path.join(process.cwd(), 'components', 'frame-initializer.tsx'),
    'Frame initializer component'
  );
  
  checkFileExists(
    path.join(process.cwd(), 'lib', 'miniapp-detection.ts'),
    'Mini App detection utilities'
  );
}

function checkLayout() {
  console.log('\n📄 Checking Layout Metadata...');
  
  const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
  
  if (!checkFileExists(layoutPath, 'app/layout.tsx')) {
    return;
  }

  try {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    if (layoutContent.includes('fc:miniapp')) {
      log('success', 'fc:miniapp meta tag present');
      CHECKS.passed++;
    } else {
      log('error', 'fc:miniapp meta tag not found');
      CHECKS.failed++;
    }

    if (layoutContent.includes('@farcaster/miniapp-sdk')) {
      log('warning', 'SDK import found in layout (might want to lazy load)');
      CHECKS.warnings++;
    }
  } catch (error) {
    log('error', `Failed to read layout: ${error.message}`);
    CHECKS.failed++;
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification Summary');
  console.log('='.repeat(50));
  log('success', `Passed: ${CHECKS.passed}`);
  if (CHECKS.warnings > 0) {
    log('warning', `Warnings: ${CHECKS.warnings}`);
  }
  if (CHECKS.failed > 0) {
    log('error', `Failed: ${CHECKS.failed}`);
  }
  
  console.log('\n');
  
  if (CHECKS.failed === 0) {
    log('success', 'Your app is ready to be a Farcaster Mini App! 🎉');
    console.log('\nNext steps:');
    console.log('1. Deploy your app to production');
    console.log('2. Register your manifest at: https://farcaster.xyz/~/developers/mini-apps/manifest');
    console.log('3. Test in preview tool: https://farcaster.xyz/~/developers/mini-apps/preview');
  } else {
    log('error', 'Please fix the errors above before deploying.');
  }
  
  console.log('\n');
}

// Run all checks
console.log('🔍 Verifying Farcaster Mini App Configuration...\n');
checkManifest();
checkSDK();
checkComponents();
checkLayout();
printSummary();

// Exit with error code if any checks failed
process.exit(CHECKS.failed > 0 ? 1 : 0);
