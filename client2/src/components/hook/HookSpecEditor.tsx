import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Info, Eye } from 'lucide-react';
import type { HookSpec, StateSpaceModel, HookCallback } from '../../types/hookSpec';
import LatexRenderer from '../common/LatexRenderer';

interface HookSpecEditorProps {
  initialSpec?: HookSpec;
  stateSpaceModel: StateSpaceModel;
  onChange: (spec: HookSpec) => void;
  onValidate: () => void;
  isValidating?: boolean;
}

const VALID_CALLBACKS: HookCallback[] = [
  'beforeInitialize', 'afterInitialize',
  'beforeAddLiquidity', 'afterAddLiquidity',
  'beforeRemoveLiquidity', 'afterRemoveLiquidity',
  'beforeSwap', 'afterSwap',
  'beforeDonate', 'afterDonate'
];

const SOLIDITY_TYPES = [
  'uint8', 'uint16', 'uint24', 'uint32', 'uint64', 'uint128', 'uint256',
  'int8', 'int16', 'int24', 'int32', 'int64', 'int128', 'int256',
  'address', 'bool', 'bytes32'
];

const DEFAULT_SPEC: HookSpec = {
  metadata: {
    name: '',
    version: '1.0.0',
    author: '',
    description: '',
    license: 'MIT'
  },
  hook_state: [],
  system_functions: [],
  invariants: []
};

export default function HookSpecEditor({
  initialSpec,
  stateSpaceModel,
  onChange,
  onValidate,
  isValidating = false
}: HookSpecEditorProps) {
  const [spec, setSpec] = useState<HookSpec>(initialSpec || DEFAULT_SPEC);
  const [activeTab, setActiveTab] = useState<'metadata' | 'state' | 'functions' | 'invariants'>('metadata');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get all available state variables for autocomplete
  const availableStateVars = [
    ...stateSpaceModel.indices.lp.map(v => v.name),
    ...stateSpaceModel.indices.trader.map(v => v.name),
    ...stateSpaceModel.indices.shared.map(v => v.name)
  ];

  const updateSpec = useCallback((updates: Partial<HookSpec>) => {
    const newSpec = { ...spec, ...updates };
    setSpec(newSpec);
    onChange(newSpec);
  }, [spec, onChange]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      // Handle PDF files
      if (file.name.endsWith('.pdf')) {
        // For PDF, we can't parse it directly in browser without a library
        // Inform user that PDF upload will store reference for manual processing
        setUploadError(
          'PDF files are accepted for reference. The PDF will be stored alongside your HookSpec. ' +
          'Please also fill in the form fields below to create the machine-readable specification.'
        );
        // Store PDF reference in metadata
        const pdfUrl = URL.createObjectURL(file);
        updateSpec({
          metadata: {
            ...spec.metadata,
            description: `${spec.metadata.description || ''}\n\n[Uploaded PDF: ${file.name}]`.trim(),
            attachments: [{ type: 'pdf', name: file.name, url: pdfUrl }]
          }
        });
        return;
      }

      const content = await file.text();
      let parsed: HookSpec;

      if (file.name.endsWith('.json')) {
        parsed = JSON.parse(content);
      } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        // Simple YAML parsing (in production, use a proper YAML library)
        setUploadError('YAML parsing requires a YAML library. Please use JSON format.');
        return;
      } else {
        setUploadError('Unsupported file format. Supported formats: .json, .yaml, .yml, .pdf');
        return;
      }

      // Basic validation
      if (!parsed.metadata?.name || !parsed.metadata?.version) {
        setUploadError('Invalid HookSpec: missing required metadata fields');
        return;
      }

      setSpec(parsed);
      onChange(parsed);
    } catch (error) {
      setUploadError(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addHookStateVariable = () => {
    updateSpec({
      hook_state: [
        ...spec.hook_state,
        { name: '', symbol: '', type: 'uint256', description: '' }
      ]
    });
  };

  const removeHookStateVariable = (index: number) => {
    updateSpec({
      hook_state: spec.hook_state.filter((_, i) => i !== index)
    });
  };

  const updateHookStateVariable = (index: number, field: string, value: string) => {
    const newState = [...spec.hook_state];
    newState[index] = { ...newState[index], [field]: value };
    updateSpec({ hook_state: newState });
  };

  const addSystemFunction = () => {
    updateSpec({
      system_functions: [
        ...spec.system_functions,
        {
          callback: 'afterSwap',
          reads: [],
          writes: [],
          transition: {
            preconditions: [],
            equation: '',
            postconditions: []
          }
        }
      ]
    });
  };

  const removeSystemFunction = (index: number) => {
    updateSpec({
      system_functions: spec.system_functions.filter((_, i) => i !== index)
    });
  };

  const addInvariant = () => {
    updateSpec({
      invariants: [
        ...(spec.invariants || []),
        { name: '', expression: '', description: '' }
      ]
    });
  };

  const removeInvariant = (index: number) => {
    updateSpec({
      invariants: (spec.invariants || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div
      className="angular-clip"
      style={{
        background: 'var(--color-white)',
        border: '2px solid var(--color-secondary)',
        padding: 'var(--space-lg)'
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3
            className="font-heading mb-1"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h4)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            HookSpec Editor
          </h3>
          <p
            className="font-body"
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            Define your hook's state variables and system functions
          </p>
        </div>

        {/* Upload Button */}
        <label
          className="angular-clip-button px-4 py-2 font-heading uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2"
          style={{
            background: 'transparent',
            color: 'var(--color-secondary)',
            border: '2px solid var(--color-secondary)',
            fontSize: 'var(--font-size-caption)',
            fontWeight: 'var(--font-weight-bold)'
          }}
        >
          <Upload size={16} />
          Upload File
          <input
            type="file"
            accept=".json,.yaml,.yml,.pdf,application/pdf,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div
          className="angular-clip p-3 mb-4 flex items-center gap-2"
          style={{
            background: 'rgba(232, 90, 79, 0.1)',
            border: '1px solid var(--color-accent)'
          }}
        >
          <AlertCircle size={18} style={{ color: 'var(--color-accent)' }} />
          <span
            className="font-body"
            style={{
              color: 'var(--color-accent)',
              fontSize: 'var(--font-size-body-sm)'
            }}
          >
            {uploadError}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b-2" style={{ borderColor: 'var(--color-secondary)' }}>
        {(['metadata', 'state', 'functions', 'invariants'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 font-heading uppercase tracking-wider transition-colors"
            style={{
              background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 'var(--font-weight-bold)',
              borderBottom: activeTab === tab ? '2px solid var(--color-secondary)' : 'none',
              marginBottom: '-2px'
            }}
          >
            {tab === 'state' ? 'Hook State' : tab === 'functions' ? 'Functions' : tab}
          </button>
        ))}
      </div>

      {/* Metadata Tab */}
      {activeTab === 'metadata' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block font-heading mb-2"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Hook Name *
              </label>
              <input
                type="text"
                value={spec.metadata.name}
                onChange={e => updateSpec({
                  metadata: { ...spec.metadata, name: e.target.value }
                })}
                placeholder="e.g., DynamicFeeHook"
                className="angular-clip w-full px-3 py-2 font-body"
                style={{
                  background: 'var(--color-marble-light)',
                  border: '2px solid var(--color-secondary)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              />
            </div>

            <div>
              <label
                className="block font-heading mb-2"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Version *
              </label>
              <input
                type="text"
                value={spec.metadata.version}
                onChange={e => updateSpec({
                  metadata: { ...spec.metadata, version: e.target.value }
                })}
                placeholder="1.0.0"
                className="angular-clip w-full px-3 py-2 font-body"
                style={{
                  background: 'var(--color-marble-light)',
                  border: '2px solid var(--color-secondary)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              />
            </div>

            <div>
              <label
                className="block font-heading mb-2"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                Author (Address) *
              </label>
              <input
                type="text"
                value={spec.metadata.author}
                onChange={e => updateSpec({
                  metadata: { ...spec.metadata, author: e.target.value }
                })}
                placeholder="0x..."
                className="angular-clip w-full px-3 py-2 font-mono"
                style={{
                  background: 'var(--color-marble-light)',
                  border: '2px solid var(--color-secondary)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              />
            </div>

            <div>
              <label
                className="block font-heading mb-2"
                style={{
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-caption)',
                  textTransform: 'uppercase'
                }}
              >
                License
              </label>
              <select
                value={spec.metadata.license || 'MIT'}
                onChange={e => updateSpec({
                  metadata: { ...spec.metadata, license: e.target.value as any }
                })}
                className="angular-clip w-full px-3 py-2 font-body"
                style={{
                  background: 'var(--color-marble-light)',
                  border: '2px solid var(--color-secondary)',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--font-size-body-sm)'
                }}
              >
                <option value="MIT">MIT</option>
                <option value="GPL-3.0">GPL-3.0</option>
                <option value="BUSL-1.1">BUSL-1.1</option>
                <option value="PROPRIETARY">Proprietary</option>
              </select>
            </div>
          </div>

          <div>
            <label
              className="block font-heading mb-2"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-caption)',
                textTransform: 'uppercase'
              }}
            >
              Description
            </label>
            <textarea
              value={spec.metadata.description || ''}
              onChange={e => updateSpec({
                metadata: { ...spec.metadata, description: e.target.value }
              })}
              placeholder="Describe what your hook does..."
              rows={3}
              className="angular-clip w-full px-3 py-2 font-body resize-none"
              style={{
                background: 'var(--color-marble-light)',
                border: '2px solid var(--color-secondary)',
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            />
          </div>
        </div>
      )}

      {/* Hook State Tab */}
      {activeTab === 'state' && (
        <div className="space-y-4">
          <div
            className="angular-clip p-3 flex items-start gap-2"
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid var(--color-primary)'
            }}
          >
            <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
            <span
              className="font-body"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            >
              Define custom state variables that your hook will maintain. These are separate from pool state variables.
            </span>
          </div>

          {spec.hook_state.map((variable, index) => (
            <div
              key={index}
              className="angular-clip p-4"
              style={{
                background: 'var(--color-marble-light)',
                border: '1px solid var(--color-accent)'
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className="font-heading"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Variable {index + 1}
                </span>
                <button
                  onClick={() => removeHookStateVariable(index)}
                  className="text-red-500 hover:text-red-700 font-heading text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={variable.name}
                  onChange={e => updateHookStateVariable(index, 'name', e.target.value)}
                  placeholder="variable_name"
                  className="angular-clip px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                />
                <input
                  type="text"
                  value={variable.symbol}
                  onChange={e => updateHookStateVariable(index, 'symbol', e.target.value)}
                  placeholder="F_acc"
                  className="angular-clip px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                />
                <select
                  value={variable.type}
                  onChange={e => updateHookStateVariable(index, 'type', e.target.value)}
                  className="angular-clip px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                >
                  {SOLIDITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={variable.description || ''}
                  onChange={e => updateHookStateVariable(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="angular-clip px-3 py-2 font-body"
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addHookStateVariable}
            className="angular-clip-button w-full px-4 py-3 font-heading uppercase tracking-wider transition-all duration-200"
            style={{
              background: 'transparent',
              color: 'var(--color-secondary)',
              border: '2px dashed var(--color-secondary)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            + Add State Variable
          </button>
        </div>
      )}

      {/* Functions Tab */}
      {activeTab === 'functions' && (
        <div className="space-y-4">
          <div
            className="angular-clip p-3 flex items-start gap-2"
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid var(--color-primary)'
            }}
          >
            <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
            <span
              className="font-body"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            >
              Define which callbacks your hook implements and how they affect state. Reference pool variables from the State Space Model.
            </span>
          </div>

          {spec.system_functions.map((func, index) => (
            <div
              key={index}
              className="angular-clip p-4"
              style={{
                background: 'var(--color-marble-light)',
                border: '1px solid var(--color-accent)'
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className="font-heading"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Function {index + 1}
                </span>
                <button
                  onClick={() => removeSystemFunction(index)}
                  className="text-red-500 hover:text-red-700 font-heading text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-heading mb-1" style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-caption)' }}>
                    Callback
                  </label>
                  <select
                    value={func.callback}
                    onChange={e => {
                      const newFuncs = [...spec.system_functions];
                      newFuncs[index] = { ...newFuncs[index], callback: e.target.value as HookCallback };
                      updateSpec({ system_functions: newFuncs });
                    }}
                    className="angular-clip w-full px-3 py-2 font-mono"
                    style={{
                      background: 'var(--color-white)',
                      border: '1px solid var(--color-secondary)',
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-caption)'
                    }}
                  >
                    {VALID_CALLBACKS.map(cb => (
                      <option key={cb} value={cb}>{cb}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-heading mb-1" style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-caption)' }}>
                      Reads (pool state vars)
                    </label>
                    <input
                      type="text"
                      value={func.reads.join(', ')}
                      onChange={e => {
                        const newFuncs = [...spec.system_functions];
                        newFuncs[index] = { ...newFuncs[index], reads: e.target.value.split(',').map(s => s.trim()).filter(Boolean) };
                        updateSpec({ system_functions: newFuncs });
                      }}
                      placeholder="sqrt_price, active_liquidity"
                      className="angular-clip w-full px-3 py-2 font-mono"
                      style={{
                        background: 'var(--color-white)',
                        border: '1px solid var(--color-secondary)',
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-caption)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block font-heading mb-1" style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-caption)' }}>
                      Writes (hook state vars)
                    </label>
                    <input
                      type="text"
                      value={func.writes.join(', ')}
                      onChange={e => {
                        const newFuncs = [...spec.system_functions];
                        newFuncs[index] = { ...newFuncs[index], writes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) };
                        updateSpec({ system_functions: newFuncs });
                      }}
                      placeholder="accumulated_fees"
                      className="angular-clip w-full px-3 py-2 font-mono"
                      style={{
                        background: 'var(--color-white)',
                        border: '1px solid var(--color-secondary)',
                        color: 'var(--color-secondary)',
                        fontSize: 'var(--font-size-caption)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-heading mb-1" style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-caption)' }}>
                    Transition Equation (LaTeX)
                  </label>
                  <textarea
                    value={func.transition.equation}
                    onChange={e => {
                      const newFuncs = [...spec.system_functions];
                      newFuncs[index] = {
                        ...newFuncs[index],
                        transition: { ...newFuncs[index].transition, equation: e.target.value }
                      };
                      updateSpec({ system_functions: newFuncs });
                    }}
                    placeholder="F_{acc}' = F_{acc} + |\Delta| \cdot \phi_{lp}"
                    rows={2}
                    className="angular-clip w-full px-3 py-2 font-mono resize-none"
                    style={{
                      background: 'var(--color-white)',
                      border: '1px solid var(--color-secondary)',
                      color: 'var(--color-secondary)',
                      fontSize: 'var(--font-size-caption)'
                    }}
                  />
                  {/* LaTeX Preview */}
                  {func.transition.equation && (
                    <div
                      className="mt-2 p-3 angular-clip flex items-center gap-2"
                      style={{
                        background: 'var(--color-marble-light)',
                        border: '1px dashed var(--color-accent)'
                      }}
                    >
                      <Eye size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                      <span
                        className="font-heading mr-2"
                        style={{
                          color: 'var(--color-accent)',
                          fontSize: 'var(--font-size-caption)',
                          textTransform: 'uppercase'
                        }}
                      >
                        Preview:
                      </span>
                      <div style={{ fontSize: 'var(--font-size-body)' }}>
                        <LatexRenderer latex={func.transition.equation} displayMode={false} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addSystemFunction}
            className="angular-clip-button w-full px-4 py-3 font-heading uppercase tracking-wider transition-all duration-200"
            style={{
              background: 'transparent',
              color: 'var(--color-secondary)',
              border: '2px dashed var(--color-secondary)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            + Add System Function
          </button>
        </div>
      )}

      {/* Invariants Tab */}
      {activeTab === 'invariants' && (
        <div className="space-y-4">
          <div
            className="angular-clip p-3 flex items-start gap-2"
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid var(--color-primary)'
            }}
          >
            <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
            <span
              className="font-body"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-body-sm)'
              }}
            >
              Define constraints that must always hold for your hook's state.
            </span>
          </div>

          {(spec.invariants || []).map((inv, index) => (
            <div
              key={index}
              className="angular-clip p-4"
              style={{
                background: 'var(--color-marble-light)',
                border: '1px solid var(--color-accent)'
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className="font-heading"
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: 'var(--font-size-caption)',
                    textTransform: 'uppercase'
                  }}
                >
                  Invariant {index + 1}
                </span>
                <button
                  onClick={() => removeInvariant(index)}
                  className="text-red-500 hover:text-red-700 font-heading text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={inv.name}
                  onChange={e => {
                    const newInvs = [...(spec.invariants || [])];
                    newInvs[index] = { ...newInvs[index], name: e.target.value };
                    updateSpec({ invariants: newInvs });
                  }}
                  placeholder="invariant_name"
                  className="angular-clip w-full px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                />
                <input
                  type="text"
                  value={inv.expression}
                  onChange={e => {
                    const newInvs = [...(spec.invariants || [])];
                    newInvs[index] = { ...newInvs[index], expression: e.target.value };
                    updateSpec({ invariants: newInvs });
                  }}
                  placeholder="F_{acc} \geq 0"
                  className="angular-clip w-full px-3 py-2 font-mono"
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                />
                <input
                  type="text"
                  value={inv.description || ''}
                  onChange={e => {
                    const newInvs = [...(spec.invariants || [])];
                    newInvs[index] = { ...newInvs[index], description: e.target.value };
                    updateSpec({ invariants: newInvs });
                  }}
                  placeholder="Description"
                  className="angular-clip w-full px-3 py-2 font-body"
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                    fontSize: 'var(--font-size-caption)'
                  }}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addInvariant}
            className="angular-clip-button w-full px-4 py-3 font-heading uppercase tracking-wider transition-all duration-200"
            style={{
              background: 'transparent',
              color: 'var(--color-secondary)',
              border: '2px dashed var(--color-secondary)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            + Add Invariant
          </button>
        </div>
      )}

      {/* Validate Button */}
      <div className="mt-6 pt-6" style={{ borderTop: '2px solid var(--color-secondary)' }}>
        <button
          onClick={onValidate}
          disabled={isValidating || !spec.metadata.name || !spec.metadata.version}
          className="angular-clip-button w-full px-6 py-3 font-heading uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: isValidating ? 'var(--color-accent)' : 'var(--color-primary)',
            color: 'var(--color-secondary)',
            border: '2px solid var(--color-secondary)',
            fontSize: 'var(--font-size-body-sm)',
            fontWeight: 'var(--font-weight-bold)',
            opacity: (!spec.metadata.name || !spec.metadata.version) ? 0.5 : 1,
            cursor: (!spec.metadata.name || !spec.metadata.version) ? 'not-allowed' : 'pointer'
          }}
        >
          {isValidating ? (
            <>
              <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Validate HookSpec
            </>
          )}
        </button>
      </div>
    </div>
  );
}
