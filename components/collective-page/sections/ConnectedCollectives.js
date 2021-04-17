import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import { CONTRIBUTE_CARD_WIDTH } from '../../contribute-cards/Contribute';
import { CONTRIBUTE_CARD_PADDING_X } from '../../contribute-cards/ContributeCardContainer';
import ContributeCollective from '../../contribute-cards/ContributeCollective';
import { Box } from '../../Grid';
import HorizontalScroller from '../../HorizontalScroller';
import { H3 } from '../../Text';
import { Dimensions } from '../_constants';
import ContributeCardsContainer from '../ContributeCardsContainer';

class ConnectedCollectives extends React.PureComponent {
  static propTypes = {
    /** Collective */
    collective: PropTypes.shape({
      slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
    }).isRequired,
    connectedCollectives: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        contributors: PropTypes.arrayOf(PropTypes.object),
      }),
    ),
  };

  getContributeCardsScrollDistance = width => {
    const oneCardScrollDistance = CONTRIBUTE_CARD_WIDTH + CONTRIBUTE_CARD_PADDING_X[0] * 2;
    if (width <= oneCardScrollDistance * 2) {
      return oneCardScrollDistance;
    } else if (width <= oneCardScrollDistance * 4) {
      return oneCardScrollDistance * 2;
    } else {
      return oneCardScrollDistance * 3;
    }
  };

  render() {
    const { connectedCollectives } = this.props;

    if (!connectedCollectives?.length) {
      return null;
    }

    return (
      <Box pb={4}>
        <HorizontalScroller getScrollDistance={this.getContributeCardsScrollDistance}>
          <div>
            <Box pb={3} px={Dimensions.PADDING_X}>
              <H3 fontSize={['20px', '24px', '32px']} fontWeight="normal" color="black.700">
                <FormattedMessage id="ConnectedCollectives" defaultMessage="Connected Collectives" />
              </H3>
            </Box>

            <ContributeCardsContainer>
              {connectedCollectives.map(({ id, collective }) => (
                <Box key={id} px={CONTRIBUTE_CARD_PADDING_X}>
                  <ContributeCollective collective={collective} />
                </Box>
              ))}
            </ContributeCardsContainer>
          </div>
        </HorizontalScroller>
      </Box>
    );
  }
}

export default injectIntl(ConnectedCollectives);
