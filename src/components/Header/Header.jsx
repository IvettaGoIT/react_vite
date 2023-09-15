import { HeaderContainer, Navigation, StyledLink } from './Header.styled';

export const Header = ({ isOrange }) => {
  console.log('isOrange', isOrange);
  return (
    <HeaderContainer>
      <Navigation>
        <StyledLink to="/first">First</StyledLink>
        <StyledLink to="/second">Second</StyledLink>
      </Navigation>
    </HeaderContainer>
  );
};
