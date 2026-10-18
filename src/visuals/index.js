import { CtiTile, CtiInteractive } from './Cti.jsx';
import { NexusTile, NexusInteractive } from './Nexus.jsx';
import { FiresenseTile, FiresenseInteractive } from './Firesense.jsx';
import { LegalTile, LegalInteractive } from './Legal.jsx';

export const VISUALS = {
  'cyber-threat-intelligence': { Tile: CtiTile, Interactive: CtiInteractive },
  'nexus-criminal-intelligence': { Tile: NexusTile, Interactive: NexusInteractive },
  firesense: { Tile: FiresenseTile, Interactive: FiresenseInteractive },
  'legal-document-summarization': { Tile: LegalTile, Interactive: LegalInteractive },
};
