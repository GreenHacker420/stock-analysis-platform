#!/usr/bin/env node

/**
 * Comprehensive test runner for Stock Analysis Platform
 * Runs all tests with coverage reporting and performance metrics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test configuration
const testConfig = {
  coverageThreshold: 80,
  maxTestDuration: 300000, // 5 minutes
  testPatterns: {
    unit: 'tests/unit/**/*.test.{js,ts,tsx}',
    integration: 'tests/integration/**/*.test.{js,ts,tsx}',
    components: 'src/components/__tests__/**/*.test.{js,ts,tsx}',
    all: '**/*.{test,spec}.{js,ts,tsx}'
  }
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  const border = '='.repeat(60);
  log(border, 'cyan');
  log(`  ${message}`, 'cyan');
  log(border, 'cyan');
}

function logSection(message) {
  log(`\n${colors.bright}${message}${colors.reset}`);
  log('-'.repeat(40), 'blue');
}

function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || error.message,
      error: error.stderr || error.message
    };
  }
}

function checkTestFiles() {
  const testDirs = ['tests/unit', 'tests/integration', 'src/components/__tests__'];
  const testFiles = [];

  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true })
        .filter(file => file.endsWith('.test.ts') || file.endsWith('.test.tsx'))
        .map(file => path.join(dir, file));
      testFiles.push(...files);
    }
  });

  return testFiles;
}

function generateTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      coverage: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
    },
    testSuites: [],
    performance: {
      totalDuration: 0,
      averageTestDuration: 0
    }
  };

  // Parse Jest output to extract metrics
  if (results.output) {
    const lines = results.output.split('\n');
    
    // Extract test counts
    const testSummaryLine = lines.find(line => line.includes('Tests:'));
    if (testSummaryLine) {
      const matches = testSummaryLine.match(/(\d+) passed|(\d+) failed|(\d+) skipped/g);
      if (matches) {
        matches.forEach(match => {
          const [count, status] = match.split(' ');
          if (status === 'passed') report.summary.passedTests = parseInt(count);
          if (status === 'failed') report.summary.failedTests = parseInt(count);
          if (status === 'skipped') report.summary.skippedTests = parseInt(count);
        });
      }
    }

    // Extract coverage information
    const coverageLines = lines.filter(line => line.includes('%'));
    coverageLines.forEach(line => {
      if (line.includes('Lines')) {
        const match = line.match(/(\d+\.?\d*)%/);
        if (match) report.summary.coverage.lines = parseFloat(match[1]);
      }
      if (line.includes('Functions')) {
        const match = line.match(/(\d+\.?\d*)%/);
        if (match) report.summary.coverage.functions = parseFloat(match[1]);
      }
      if (line.includes('Branches')) {
        const match = line.match(/(\d+\.?\d*)%/);
        if (match) report.summary.coverage.branches = parseFloat(match[1]);
      }
      if (line.includes('Statements')) {
        const match = line.match(/(\d+\.?\d*)%/);
        if (match) report.summary.coverage.statements = parseFloat(match[1]);
      }
    });

    // Extract duration
    const durationLine = lines.find(line => line.includes('Time:'));
    if (durationLine) {
      const match = durationLine.match(/(\d+\.?\d*)\s*s/);
      if (match) report.performance.totalDuration = parseFloat(match[1]);
    }
  }

  report.summary.totalTests = report.summary.passedTests + report.summary.failedTests + report.summary.skippedTests;
  
  if (report.summary.totalTests > 0) {
    report.performance.averageTestDuration = report.performance.totalDuration / report.summary.totalTests;
  }

  return report;
}

function displayResults(report) {
  logSection('Test Results Summary');
  
  log(`Total Tests: ${report.summary.totalTests}`, 'bright');
  log(`✅ Passed: ${report.summary.passedTests}`, 'green');
  
  if (report.summary.failedTests > 0) {
    log(`❌ Failed: ${report.summary.failedTests}`, 'red');
  }
  
  if (report.summary.skippedTests > 0) {
    log(`⏭️  Skipped: ${report.summary.skippedTests}`, 'yellow');
  }

  logSection('Coverage Report');
  
  const coverage = report.summary.coverage;
  const avgCoverage = (coverage.lines + coverage.functions + coverage.branches + coverage.statements) / 4;
  
  log(`Lines: ${coverage.lines.toFixed(1)}%`, coverage.lines >= testConfig.coverageThreshold ? 'green' : 'red');
  log(`Functions: ${coverage.functions.toFixed(1)}%`, coverage.functions >= testConfig.coverageThreshold ? 'green' : 'red');
  log(`Branches: ${coverage.branches.toFixed(1)}%`, coverage.branches >= testConfig.coverageThreshold ? 'green' : 'red');
  log(`Statements: ${coverage.statements.toFixed(1)}%`, coverage.statements >= testConfig.coverageThreshold ? 'green' : 'red');
  log(`Average: ${avgCoverage.toFixed(1)}%`, avgCoverage >= testConfig.coverageThreshold ? 'green' : 'red');

  logSection('Performance Metrics');
  
  log(`Total Duration: ${report.performance.totalDuration.toFixed(2)}s`, 'bright');
  log(`Average Test Duration: ${(report.performance.averageTestDuration * 1000).toFixed(2)}ms`, 'bright');

  // Overall status
  const allTestsPassed = report.summary.failedTests === 0;
  const coverageMet = avgCoverage >= testConfig.coverageThreshold;
  const performanceGood = report.performance.totalDuration < testConfig.maxTestDuration / 1000;

  logSection('Overall Status');
  
  if (allTestsPassed && coverageMet && performanceGood) {
    log('🎉 All tests passed with good coverage and performance!', 'green');
    return true;
  } else {
    if (!allTestsPassed) log('❌ Some tests failed', 'red');
    if (!coverageMet) log(`❌ Coverage below threshold (${testConfig.coverageThreshold}%)`, 'red');
    if (!performanceGood) log('⚠️  Tests took longer than expected', 'yellow');
    return false;
  }
}

function saveReport(report) {
  const reportsDir = 'coverage/reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportFile = path.join(reportsDir, `test-report-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log(`\n📊 Detailed report saved to: ${reportFile}`, 'cyan');
}

function runTestSuite(pattern, name) {
  logSection(`Running ${name} Tests`);
  
  const command = `npx jest ${pattern} --coverage --verbose --passWithNoTests`;
  log(`Command: ${command}`, 'blue');
  
  const startTime = Date.now();
  const result = executeCommand(command);
  const duration = Date.now() - startTime;
  
  if (result.success) {
    log(`✅ ${name} tests completed in ${duration}ms`, 'green');
  } else {
    log(`❌ ${name} tests failed`, 'red');
    if (result.error) {
      log(`Error: ${result.error}`, 'red');
    }
  }
  
  return { ...result, duration, name };
}

function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  logHeader('Stock Analysis Platform - Test Runner');
  
  // Check if test files exist
  const testFiles = checkTestFiles();
  log(`Found ${testFiles.length} test files`, 'bright');
  
  if (testFiles.length === 0) {
    log('⚠️  No test files found!', 'yellow');
    process.exit(1);
  }

  // Display test files
  logSection('Test Files');
  testFiles.forEach(file => log(`  📄 ${file}`, 'blue'));

  let results;
  
  switch (testType) {
    case 'unit':
      results = runTestSuite(testConfig.testPatterns.unit, 'Unit');
      break;
    case 'integration':
      results = runTestSuite(testConfig.testPatterns.integration, 'Integration');
      break;
    case 'components':
      results = runTestSuite(testConfig.testPatterns.components, 'Component');
      break;
    case 'all':
    default:
      logSection('Running All Tests');
      const command = 'npx jest --coverage --verbose --passWithNoTests';
      log(`Command: ${command}`, 'blue');
      
      const startTime = Date.now();
      results = executeCommand(command);
      results.duration = Date.now() - startTime;
      results.name = 'All Tests';
      break;
  }

  // Generate and display report
  const report = generateTestReport(results);
  const success = displayResults(report);
  
  // Save detailed report
  saveReport(report);
  
  // Display raw output if tests failed
  if (!results.success && results.output) {
    logSection('Test Output');
    console.log(results.output);
  }
  
  if (!results.success && results.error) {
    logSection('Error Details');
    console.error(results.error);
  }

  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`❌ Uncaught Exception: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = {
  runTestSuite,
  generateTestReport,
  displayResults,
  checkTestFiles
};
