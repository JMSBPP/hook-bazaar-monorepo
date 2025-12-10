import React, { useState } from 'react';
import {
  TestType,
  SwapTestParams,
  LiquidityTestParams,
  FunctionalityTestRequest,
  FunctionalityTestResult,
  TestDeviation,
  TestDeviationSeverity,
} from '../../types/hookSpec';

interface FunctionalityTesterProps {
  hookTokenId: number;
  hookName: string;
  onClose: () => void;
  onTestComplete?: (result: FunctionalityTestResult) => void;
}

const FunctionalityTester: React.FC<FunctionalityTesterProps> = ({
  hookTokenId,
  hookName,
  onClose,
  onTestComplete,
}) => {
  const [testType, setTestType] = useState<TestType>('SWAP');
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<FunctionalityTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Swap params
  const [zeroForOne, setZeroForOne] = useState(true);
  const [amountSpecified, setAmountSpecified] = useState('1000000000000000000');
  const [sqrtPriceLimitX96, setSqrtPriceLimitX96] = useState('79228162514264337593543950336');

  // Liquidity params
  const [tickLower, setTickLower] = useState(-887220);
  const [tickUpper, setTickUpper] = useState(887220);
  const [liquidityDelta, setLiquidityDelta] = useState('1000000000000000000');

  // Custom params
  const [customParams, setCustomParams] = useState('{}');

  // Expected behavior
  const [expectedBehavior, setExpectedBehavior] = useState('');

  const handleRunTest = async () => {
    setIsTesting(true);
    setError(null);
    setResult(null);

    try {
      const swapParams: SwapTestParams | undefined =
        testType === 'SWAP'
          ? {
              zeroForOne,
              amountSpecified,
              sqrtPriceLimitX96,
            }
          : undefined;

      const liquidityParams: LiquidityTestParams | undefined =
        testType === 'LIQUIDITY'
          ? {
              tickLower,
              tickUpper,
              liquidityDelta,
            }
          : undefined;

      let parsedCustomParams: Record<string, unknown> | undefined;
      if (testType === 'CUSTOM') {
        try {
          parsedCustomParams = JSON.parse(customParams);
        } catch {
          throw new Error('Invalid JSON in custom parameters');
        }
      }

      const request: FunctionalityTestRequest = {
        hookTokenId,
        testType,
        testData: {
          swapParams,
          liquidityParams,
          customParams: parsedCustomParams,
        },
        expectedBehavior: expectedBehavior || undefined,
      };

      // Mock API call - replace with actual AVS API
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mock result
      const mockResult: FunctionalityTestResult = {
        success: true,
        testId: `test-${Date.now()}`,
        avsVerificationId: `avs-${Date.now()}`,
        accuracyScore: 95,
        behaviorMatch: true,
        report: {
          inputSummary: `${testType} test with ${
            testType === 'SWAP'
              ? `amount: ${amountSpecified}, zeroForOne: ${zeroForOne}`
              : testType === 'LIQUIDITY'
              ? `ticks: [${tickLower}, ${tickUpper}], delta: ${liquidityDelta}`
              : 'custom parameters'
          }`,
          expectedOutput: expectedBehavior || 'Standard hook behavior',
          actualOutput: 'Hook executed successfully with expected state changes',
          deviations: [
            {
              field: 'gasUsed',
              expected: '150000',
              actual: '145230',
              severity: 'INFO' as TestDeviationSeverity,
            },
          ],
          gasUsed: '145230',
          executionTimeMs: 2450,
        },
        attestation: {
          attestationId: `att-${Date.now()}`,
          attesters: [
            '0x1111111111111111111111111111111111111111',
            '0x2222222222222222222222222222222222222222',
            '0x3333333333333333333333333333333333333333',
          ],
          consensus: 100,
          timestamp: Math.floor(Date.now() / 1000),
        },
      };

      setResult(mockResult);
      onTestComplete?.(mockResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test execution failed');
    } finally {
      setIsTesting(false);
    }
  };

  const getSeverityColor = (severity: TestDeviationSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'WARNING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'INFO':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
    }
  };

  const getAccuracyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderTestParams = () => {
    switch (testType) {
      case 'SWAP':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Swap Direction
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={zeroForOne}
                    onChange={() => setZeroForOne(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Token0 → Token1</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!zeroForOne}
                    onChange={() => setZeroForOne(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Token1 → Token0</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Specified (wei)
              </label>
              <input
                type="text"
                value={amountSpecified}
                onChange={(e) => setAmountSpecified(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="1000000000000000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sqrt Price Limit X96
              </label>
              <input
                type="text"
                value={sqrtPriceLimitX96}
                onChange={(e) => setSqrtPriceLimitX96(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="79228162514264337593543950336"
              />
            </div>
          </div>
        );

      case 'LIQUIDITY':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tick Lower
                </label>
                <input
                  type="number"
                  value={tickLower}
                  onChange={(e) => setTickLower(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tick Upper
                </label>
                <input
                  type="number"
                  value={tickUpper}
                  onChange={(e) => setTickUpper(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liquidity Delta (wei)
              </label>
              <input
                type="text"
                value={liquidityDelta}
                onChange={(e) => setLiquidityDelta(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="1000000000000000000"
              />
            </div>
          </div>
        );

      case 'INITIALIZE':
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Initialize test will verify the hook's beforeInitialize and afterInitialize
              callbacks with default pool parameters.
            </p>
          </div>
        );

      case 'CUSTOM':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Parameters (JSON)
            </label>
            <textarea
              value={customParams}
              onChange={(e) => setCustomParams(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm h-32"
              placeholder='{"param1": "value1", "param2": 123}'
            />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AVS Functionality Testing
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Test hook behavior and get AVS accuracy report for {hookName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!result ? (
            <>
              {/* Test Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Test Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['SWAP', 'LIQUIDITY', 'INITIALIZE', 'CUSTOM'] as TestType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTestType(type)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        testType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Parameters */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Test Parameters</h3>
                {renderTestParams()}
              </div>

              {/* Expected Behavior */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Behavior (Optional)
                </label>
                <textarea
                  value={expectedBehavior}
                  onChange={(e) => setExpectedBehavior(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                  placeholder="Describe the expected hook behavior in natural language..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a description of expected behavior to help AVS operators validate results
                </p>
              </div>

              {/* Run Test Button */}
              <button
                onClick={handleRunTest}
                disabled={isTesting}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isTesting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Running AVS Test...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Run Functionality Test
                  </>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Test Failed</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              )}
            </>
          ) : (
            /* Test Results */
            <div className="space-y-6">
              {/* Accuracy Score */}
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-4">
                  <span className={`text-4xl font-bold ${getAccuracyColor(result.accuracyScore)}`}>
                    {result.accuracyScore}%
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Accuracy Score</h3>
                <p className={`text-sm ${result.behaviorMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {result.behaviorMatch ? 'Behavior matches specification' : 'Behavior deviates from specification'}
                </p>
              </div>

              {/* Test Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Test ID</p>
                  <p className="text-sm font-mono text-gray-900">{result.testId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">AVS Verification ID</p>
                  <p className="text-sm font-mono text-gray-900">{result.avsVerificationId}</p>
                </div>
              </div>

              {/* Execution Report */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Execution Report</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Input Summary</p>
                    <p className="text-sm text-gray-700">{result.report.inputSummary}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expected Output</p>
                    <p className="text-sm text-gray-700">{result.report.expectedOutput}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Actual Output</p>
                    <p className="text-sm text-gray-700">{result.report.actualOutput}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gas Used</p>
                      <p className="text-sm font-mono text-gray-900">{result.report.gasUsed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Execution Time</p>
                      <p className="text-sm font-mono text-gray-900">{result.report.executionTimeMs}ms</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deviations */}
              {result.report.deviations.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Deviations</h4>
                  <div className="space-y-2">
                    {result.report.deviations.map((deviation: TestDeviation, index: number) => {
                      const colors = getSeverityColor(deviation.severity);
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${colors.text}`}>
                              {deviation.field}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.text} ${colors.bg}`}>
                              {deviation.severity}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Expected:</span>{' '}
                              <span className="font-mono">{deviation.expected}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Actual:</span>{' '}
                              <span className="font-mono">{deviation.actual}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AVS Attestation */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">AVS Attestation</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Attestation ID</span>
                    <span className="text-sm font-mono text-gray-900">{result.attestation.attestationId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Consensus</span>
                    <span className={`text-sm font-medium ${result.attestation.consensus >= 66 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.attestation.consensus}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Timestamp</span>
                    <span className="text-sm text-gray-900">
                      {new Date(result.attestation.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Attesters ({result.attestation.attesters.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {result.attestation.attesters.map((attester, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700"
                        >
                          {attester.slice(0, 6)}...{attester.slice(-4)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Run Another Test
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              AVS operators will execute your test parameters against the hook and provide
              an attestation on the results. The accuracy score reflects how closely the
              actual behavior matches the hook specification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionalityTester;
